import * as THREE from 'three'
import type { FogExp2 } from 'three'
import {
  ABOUT_COLORS,
  aboutTransitionT,
  type AboutSceneProfile,
} from './aboutSceneConfig'
import { isLine2Object } from '../OrigamiAviaryBackground/lineBatch'
import { AVIARY_COLORS } from '../OrigamiAviaryBackground/constants'
import { scrollParallaxDrive } from '../OrigamiAviaryBackground/sceneAnchor'
import type { AviaryBird } from '../OrigamiAviaryBackground/birdMotion'
import type { OrigamiCatSystem } from '../OrigamiAviaryBackground/origamiCat'
import type { AboutBat } from './batMotion'
import { computeAboutSurfaceVis } from './aboutSurfaceVis'

const aviaryFogColor = new THREE.Color(AVIARY_COLORS.fog)
const cavernFogColor = new THREE.Color(ABOUT_COLORS.cavernFog)
const aviaryBgColor = new THREE.Color(AVIARY_COLORS.background)
const cavernBgColor = new THREE.Color(ABOUT_COLORS.cavernBackground)

export type AboutTransitionTargets = {
  /** Forest, grid, birds, cat — not the cavern layer */
  surfaceWorld: THREE.Group
  cavern: THREE.Group
  scene: THREE.Scene
  fog: FogExp2
  renderer: THREE.WebGLRenderer | null
  birds: AviaryBird[]
  bats: AboutBat[]
  /** Aviary atmosphere on `stage` (not under `world`) */
  surfaceLayers: THREE.Object3D[]
  cat: OrigamiCatSystem | null
  readabilityEl: HTMLElement | null
  upperFogDensity: number
}

/** Re-export for callers that only need the visibility curve. */
export { computeAboutSurfaceVis } from './aboutSurfaceVis'

type OpacityMat = THREE.Material & { opacity: number; userData: { baseOpacity?: number } }

function materialBaseOpacity(mat: OpacityMat): number | null {
  const stored = mat.userData.baseOpacity
  if (stored !== undefined && stored > 0.001) return stored
  if (mat.opacity > 0.001) {
    mat.userData.baseOpacity = mat.opacity
    return mat.opacity
  }
  return null
}

function applyMaterialOpacity(mat: OpacityMat, vis: number) {
  const base = materialBaseOpacity(mat)
  if (base === null) return
  mat.transparent = true
  mat.opacity = vis <= 0 ? 0 : base * vis
}

function applyLineOpacity(obj: THREE.Object3D, vis: number) {
  if (isLine2Object(obj)) {
    applyMaterialOpacity(obj.material, vis)
    return
  }
  if (obj instanceof THREE.LineSegments || obj instanceof THREE.Mesh) {
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach((mat) => {
      if (mat && 'opacity' in mat) applyMaterialOpacity(mat as OpacityMat, vis)
    })
  }
}

function setGroupOpacity(g: THREE.Object3D, vis: number) {
  g.traverse((o) => applyLineOpacity(o, vis))
}

/** One-time capture for materials built before fade logic (atmosphere arcs, etc.). */
export function seedSurfaceOpacityBaselines(...roots: THREE.Object3D[]) {
  for (const root of roots) {
    root.traverse((o) => applyLineOpacity(o, 1))
  }
}

/** Aviary / forest surface — 0 when scroll `entry` reaches 1 (about-descent-end). */
export function applyAboutSurfaceFade(targets: AboutTransitionTargets, surfaceVis: number) {
  const show = surfaceVis > 0.001

  targets.surfaceWorld.visible = show
  setGroupOpacity(targets.surfaceWorld, surfaceVis)

  for (const layer of targets.surfaceLayers) {
    layer.visible = show
    setGroupOpacity(layer, surfaceVis)
  }

  if (targets.cat) {
    targets.cat.rig.root.visible = show
    setGroupOpacity(targets.cat.rig.root, surfaceVis)
  }

  for (const b of targets.birds) {
    b.rig.root.visible = show
    b.rig.edgeMats.forEach((m) => applyMaterialOpacity(m, surfaceVis))
    b.rig.root.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshBasicMaterial) {
        if (o.userData.baseFill === undefined && o.material.opacity > 0.001) {
          o.userData.baseFill = o.material.opacity
        }
        const base = o.userData.baseFill as number | undefined
        if (base !== undefined) {
          o.material.opacity = surfaceVis <= 0 ? 0 : base * surfaceVis
        }
      }
    })
  }

  if (targets.readabilityEl) {
    targets.readabilityEl.style.setProperty('--origami-surface-vis', String(surfaceVis))
  }
}

/** Blend homepage parallax with scroll-driven inversion, then subtle depth sink. */
export function applyCavernInversionMotion(
  stage: THREE.Object3D,
  scrollSmooth: number,
  scrollRotateIntensity: number,
  entry: number,
  depth: number,
  profile: AboutSceneProfile,
) {
  const inv = aboutTransitionT(entry, profile.transition) * profile.transition.inversionStrength
  const drive = scrollParallaxDrive(scrollSmooth)
  const ri = scrollRotateIntensity
  const damp = 1 - inv * 0.88 - depth * 0.22
  const { transition: tr, descent: d } = profile

  const px = drive * ri * 0.68 * damp
  const py = drive * ri * 1.05 * damp
  const pz = drive * ri * 0.32 * damp
  const posY = drive * ri * 0.14 * damp
  const posZ = drive * ri * 0.42 * damp

  const invX = inv * tr.rotationAmount
  const invPosY = inv * tr.cameraDriftY * 0.35
  const invPosZ = inv * tr.cameraDriftZ * 0.2

  stage.rotation.x = THREE.MathUtils.lerp(px, invX, inv) + depth * d.maxStageTiltX
  stage.rotation.y = THREE.MathUtils.lerp(py, 0, inv)
  stage.rotation.z = THREE.MathUtils.lerp(pz, 0, inv)
  stage.position.y =
    THREE.MathUtils.lerp(posY, invPosY, inv) - inv * d.entrySinkY - depth * d.depthSinkY
  stage.position.z =
    THREE.MathUtils.lerp(posZ, invPosZ, inv) - depth * d.depthSinkZ
}

/** Aviary ↔ cavern crossfade tied to inversion (bidirectional on scroll). */
export function applyAboutScrollTransition(
  entry: number,
  profile: AboutSceneProfile,
  targets: AboutTransitionTargets,
) {
  const invT = aboutTransitionT(entry, profile.transition) * profile.transition.inversionStrength
  const surfaceVis = computeAboutSurfaceVis(entry)
  const cavernVis = THREE.MathUtils.smoothstep(0.06, 0.72, entry)

  targets.cavern.visible = cavernVis > 0.001
  setGroupOpacity(targets.cavern, cavernVis)

  return { t: invT, revealCavern: cavernVis, surfaceVis }
}

/** Deeper scroll through About — fog, cyan, bats, darkness. */
export function applyCavernDepthEffects(
  depth: number,
  entry: number,
  revealCavern: number,
  surfaceVis: number,
  profile: AboutSceneProfile,
  targets: AboutTransitionTargets,
) {
  const d = profile.descent
  const invT = aboutTransitionT(entry, profile.transition) * profile.transition.inversionStrength
  const forestRetire = 1 - surfaceVis
  const mix = THREE.MathUtils.clamp(
    Math.max(forestRetire, revealCavern * 0.55 + depth * 0.45),
    0,
    1,
  )

  const fogBase = THREE.MathUtils.lerp(targets.upperFogDensity, profile.cavern.fogDensity, mix)
  targets.fog.density = fogBase + depth * d.fogDepthBoost * invT
  targets.fog.color.copy(aviaryFogColor).lerp(cavernFogColor, mix)
  const sky = aviaryBgColor.clone().lerp(cavernBgColor, mix)
  if (targets.scene.background instanceof THREE.Color) {
    targets.scene.background.copy(sky)
  }
  targets.renderer?.setClearColor(sky, 1)

  const cavernBoost = revealCavern * THREE.MathUtils.lerp(0.65, 1, depth)
  setGroupOpacity(targets.cavern, cavernBoost)

  for (let i = 0; i < targets.bats.length; i++) {
    const bat = targets.bats[i]
    const threshold = (i + 0.5) / Math.max(1, targets.bats.length)
    const batVis =
      revealCavern *
      THREE.MathUtils.smoothstep(threshold - 0.22, threshold + 0.08, depth)
    bat.rig.root.visible = batVis > 0.04
    bat.rig.lines.forEach((line) => applyLineOpacity(line, batVis))
  }

  if (targets.readabilityEl) {
    targets.readabilityEl.style.setProperty('--origami-about-mix', String(mix))
    targets.readabilityEl.style.setProperty('--origami-cavern-depth', String(depth))
  }

  return mix
}
