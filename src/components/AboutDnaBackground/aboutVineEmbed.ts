import * as THREE from 'three'
import { isLine2Object } from '../OrigamiAviaryBackground/lineBatch'
import { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'
import {
  readAboutVineFadeOpacity,
  readAboutVineScrollT,
} from '../OrigamiAboutBackground/homeDescentProgress'
import { getAboutDnaConfig, getStalkVerticalBounds, type AboutDnaConfig } from './dnaConfig'
import { buildAboutVinePlant, type AboutVinePlant } from './vineFoliage'

const CAMERA_LOOK_Y = -0.38

function getCameraHalfHeight(cfg: AboutDnaConfig): number {
  const { yMin, yMax } = getStalkVerticalBounds(cfg)
  return Math.min(4.25, Math.max(-yMin, yMax) * 0.21)
}

export function computeStalkPanY(cfg: AboutDnaConfig, progress: number): number {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  const { yMin, yMax } = getStalkVerticalBounds(cfg)
  const halfH = getCameraHalfHeight(cfg)
  const viewSpan = halfH * 2
  const windowBottom = THREE.MathUtils.lerp(
    Math.max(yMin, yMax - viewSpan) + cfg.stalkPanStartBias,
    yMin,
    t,
  )
  const frustumBottom = CAMERA_LOOK_Y - halfH
  return frustumBottom - windowBottom
}

type OpacityMat = THREE.Material & { opacity: number; userData: { baseOpacity?: number } }

function captureBaseOpacity(mat: OpacityMat) {
  if (mat.userData.baseOpacity === undefined && mat.opacity > 0.001) {
    mat.userData.baseOpacity = mat.opacity
  }
}

function applyOpacityToRoot(root: THREE.Object3D, mul: number) {
  root.traverse((obj) => {
    if (isLine2Object(obj)) {
      captureBaseOpacity(obj.material)
      const base = obj.material.userData.baseOpacity as number | undefined
      if (base !== undefined) {
        obj.material.transparent = true
        obj.material.opacity = mul <= 0 ? 0 : base * mul
      }
      return
    }
    if (obj instanceof THREE.LineSegments || obj instanceof THREE.Mesh) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((mat) => {
        if (mat && 'opacity' in mat) {
          captureBaseOpacity(mat as OpacityMat)
          const base = (mat as OpacityMat).userData.baseOpacity as number | undefined
          if (base !== undefined) {
            ;(mat as OpacityMat).transparent = true
            ;(mat as OpacityMat).opacity = mul <= 0 ? 0 : base * mul
          }
        }
      })
    }
  })
}

export type EmbeddedAboutVine = {
  rig: THREE.Group
  plant: AboutVinePlant
  roots: THREE.Object3D[]
  cfg: AboutDnaConfig
}

export function buildEmbeddedAboutVine(world: THREE.Group): EmbeddedAboutVine {
  const cfg = getAboutDnaConfig('fragile-embed')
  const rng = createMulberry32(0x7a1ec41e)
  const roots: THREE.Object3D[] = []

  const rig = new THREE.Group()
  rig.name = 'about-vine-embed-rig'
  rig.visible = false
  world.add(rig)

  const plant = buildAboutVinePlant(rig, cfg, roots, rng)
  plant.group.position.set(cfg.stalkOffsetX * 0.35, 0, 0)
  rig.rotation.set(0.12, -0.42, 0.04)
  rig.position.set(15.5, -1.2, -7.5)
  rig.scale.setScalar(0.52)

  applyOpacityToRoot(plant.group, 1)

  return { rig, plant, roots, cfg }
}

export function updateEmbeddedAboutVine(
  embed: EmbeddedAboutVine,
  elapsed: number,
  depth: number,
  reducedMotion: boolean,
): number {
  const vineFade = readAboutVineFadeOpacity()
  const scrollT = readAboutVineScrollT()
  const show = vineFade > 0.02

  embed.rig.visible = show
  if (!show) return vineFade

  const scrollPhase = scrollT * embed.cfg.scrollHelixTurns * Math.PI * 2
  const panY = computeStalkPanY(embed.cfg, scrollT)
  const idleTwist = reducedMotion ? 0 : Math.sin(elapsed * 0.42) * 0.06
  embed.plant.updatePhase(scrollPhase + idleTwist)

  const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.38) * 0.02
  embed.rig.rotation.set(0.12 + sway * 0.3, -0.42 + sway * 0.2, 0.04 + sway * 0.15)
  embed.rig.position.set(15.5, -1.2 + panY * 0.22 - depth * 0.35, -7.5 - depth * 1.8)

  applyOpacityToRoot(embed.plant.group, vineFade)
  return vineFade
}

export function disposeEmbeddedAboutVine(embed: EmbeddedAboutVine, world: THREE.Group) {
  world.remove(embed.rig)
  embed.rig.traverse((obj) => {
    if (isLine2Object(obj)) {
      obj.geometry?.dispose()
      obj.material?.dispose()
    }
    if (obj instanceof THREE.Points) {
      obj.geometry?.dispose()
      const m = obj.material
      if (Array.isArray(m)) m.forEach((mat) => mat.dispose())
      else m.dispose()
    }
  })
}
