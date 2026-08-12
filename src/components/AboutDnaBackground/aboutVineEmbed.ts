import * as THREE from 'three'
import { isLine2Object } from '../OrigamiAviaryBackground/lineBatch'
import { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'
import {
  readAboutVineFadeOpacity,
  readAboutVineScrollT,
} from '../OrigamiAboutBackground/homeDescentProgress'
import { getAboutDnaConfig, getStalkVerticalBounds, type AboutDnaConfig } from './dnaConfig'
import { buildAboutVinePlant, type AboutVinePlant } from './vineFoliage'

function getCameraHalfHeight(cfg: AboutDnaConfig): number {
  const { yMin, yMax } = getStalkVerticalBounds(cfg)
  return Math.min(4.6, Math.max(-yMin, yMax) * 0.22)
}

export function computeStalkPanY(cfg: AboutDnaConfig, progress: number): number {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  const { yMin, yMax } = getStalkVerticalBounds(cfg)
  const halfH = getCameraHalfHeight(cfg)
  const viewSpan = halfH * 2
  const windowBottom = THREE.MathUtils.lerp(
    Math.max(yMin, yMax - viewSpan) + cfg.stalkPanStartBias,
    yMin - cfg.stalkPanEndBoost * 0.35,
    t,
  )
  return -halfH - windowBottom
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
  const cfg = getAboutDnaConfig('forest-embed')
  const rng = createMulberry32(0x7a1ec41e)
  const roots: THREE.Object3D[] = []

  const rig = new THREE.Group()
  rig.name = 'about-vine-embed-rig'
  rig.visible = false
  world.add(rig)

  const plant = buildAboutVinePlant(rig, cfg, roots, rng)
  plant.group.position.set(cfg.stalkOffsetX * 0.42, 0, 0)
  rig.rotation.set(0.05, -0.18, 0.012)
  rig.position.set(3.6, 0.2, -10.2)
  rig.scale.setScalar(0.74)

  applyOpacityToRoot(plant.group, 1)

  return { rig, plant, roots, cfg }
}

export function updateEmbeddedAboutVine(
  embed: EmbeddedAboutVine,
  elapsed: number,
  entry: number,
  depth: number,
  reducedMotion: boolean,
): number {
  const vineFade = readAboutVineFadeOpacity()
  const scrollT = readAboutVineScrollT()
  const emerge = Math.min(
    1,
    Math.max(vineFade, THREE.MathUtils.smoothstep(0.38, 0.76, entry)),
  )
  const show = emerge > 0.02

  embed.rig.visible = show
  if (!show) return emerge

  const scrollPhase = scrollT * embed.cfg.scrollHelixTurns * Math.PI * 2
  const panY = computeStalkPanY(embed.cfg, scrollT)
  const idleTwist = reducedMotion ? 0 : Math.sin(elapsed * 0.42) * 0.05
  embed.plant.updatePhase(scrollPhase + idleTwist)

  const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.38) * 0.018
  const sink = entry * 0.42 + depth * 0.55
  embed.rig.rotation.set(
    0.05 + sway * 0.25 + entry * 0.04,
    -0.18 + sway * 0.15,
    0.012 + sway * 0.1,
  )
  embed.rig.position.set(
    3.6 + sway * 0.08,
    0.2 + panY * 0.32 - sink * 0.28,
    -10.2 - sink * 1.05,
  )

  applyOpacityToRoot(embed.plant.group, emerge)
  return emerge
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
