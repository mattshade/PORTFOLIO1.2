import * as THREE from 'three'
import {
  applyBatGlidePose,
  applyBatHangPose,
  createOrigamiBat,
  type BatRig,
} from '../OrigamiAboutBackground/origamiBat'
import { AVIARY_COLORS, type OrigamiAviaryTuning } from './constants'
import type { Perch } from './environment'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type AviaryBatPerch = {
  position: THREE.Vector3
  yaw: number
}

export type AviaryBat = {
  rig: BatRig
  state: 'hang' | 'glide'
  stateTime: number
  nextChangeAt: number
  perchIndex: number
  glideFrom: THREE.Vector3
  glideTo: THREE.Vector3
  glideFromYaw: number
  glideToYaw: number
  glideDuration: number
  wingPhase: number
}

const _offset = new THREE.Vector3()

function forestInnerRadius(tuning: OrigamiAviaryTuning): number {
  return Math.max(3.6, tuning.forestHalfWidth * 0.1)
}

function forestOuterRadius(tuning: OrigamiAviaryTuning): number {
  return tuning.forestHalfWidth * 0.6
}

/** High tree branches + mid-canopy glide points for forest bats. */
export function buildAviaryBatPerches(
  perches: Perch[],
  rng: Rng,
  tuning: OrigamiAviaryTuning,
): AviaryBatPerch[] {
  const out: AviaryBatPerch[] = []
  const treePerches = perches
    .filter((p) => p.surface === 'tree' && p.position.y >= 1.35)
    .sort((a, b) => b.position.y - a.position.y)

  const step = Math.max(1, Math.floor(treePerches.length / 14))
  for (let i = 0; i < treePerches.length; i += step) {
    const p = treePerches[i]
    _offset.set((rng() - 0.5) * 0.22, 0.04 + rng() * 0.08, (rng() - 0.5) * 0.16)
    out.push({
      position: p.position.clone().add(_offset),
      yaw: p.yaw + (rng() - 0.5) * 0.9,
    })
  }

  const inner = forestInnerRadius(tuning)
  const outer = forestOuterRadius(tuning)
  const glidePool = 6 + Math.floor(rng() * 4)
  for (let i = 0; i < glidePool; i++) {
    const angle = rng() * Math.PI * 2
    const radius = inner + rng() * (outer - inner)
    out.push({
      position: new THREE.Vector3(
        Math.sin(angle) * radius,
        2.8 + rng() * 5.2,
        -Math.cos(angle) * radius,
      ),
      yaw: rng() * Math.PI * 2,
    })
  }

  return out
}

function pickGlideTarget(rng: Rng, perches: AviaryBatPerch[], avoid: number): number {
  const candidates = perches.map((_, i) => i).filter((i) => i !== avoid)
  return candidates[Math.floor(rng() * candidates.length)] ?? avoid
}

function batLineOpacity(tuning: OrigamiAviaryTuning): number {
  return Math.min(0.52, tuning.lineOpacity * 2.65 * tuning.flockBirdEdgeOpacityMul)
}

export function populateAviaryBats(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  perches: AviaryBatPerch[],
  accent: THREE.Color,
  muted: THREE.Color,
  roots: THREE.Object3D[],
): AviaryBat[] {
  if (tuning.batCount <= 0 || perches.length === 0) return []

  const bats: AviaryBat[] = []
  const count = Math.min(tuning.batCount, perches.length)
  const used = new Set<number>()
  const lineColor = new THREE.Color(tuning.accentColor)
  const opacity = batLineOpacity(tuning)

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(rng() * perches.length)
    for (let guard = 0; guard < 24 && used.has(idx); guard++) idx = Math.floor(rng() * perches.length)
    used.add(idx)

    const rig = createOrigamiBat(accent, muted, opacity, tuning.lineWidth, tuning.sceneDepth, roots, {
      lineColor,
      fog: true,
      depthFade: 1,
    })
    rig.root.scale.setScalar(tuning.batScale * (0.92 + rng() * 0.18))
    rig.root.renderOrder = 6

    const p = perches[idx]
    rig.root.position.copy(p.position)
    rig.root.rotation.y = p.yaw
    applyBatHangPose(rig, rng() * Math.PI * 2)
    parent.add(rig.root)

    bats.push({
      rig,
      state: 'hang',
      stateTime: 0,
      nextChangeAt: 10 + rng() * 22,
      perchIndex: idx,
      glideFrom: p.position.clone(),
      glideTo: p.position.clone(),
      glideFromYaw: p.yaw,
      glideToYaw: p.yaw,
      glideDuration: 2.4 + rng() * 2,
      wingPhase: rng() * Math.PI * 2,
    })
  }

  return bats
}

export function updateAviaryBats(
  bats: AviaryBat[],
  perches: AviaryBatPerch[],
  elapsed: number,
  delta: number,
  tuning: OrigamiAviaryTuning,
  rng: Rng,
  reducedMotion: boolean,
) {
  if (bats.length === 0) return

  let flying = 0
  for (const b of bats) {
    if (b.state === 'glide') flying++
  }

  for (const b of bats) {
    b.stateTime += delta
    b.wingPhase += delta * (b.state === 'glide' ? 2.6 : 0.85)

    if (
      !reducedMotion &&
      b.state === 'hang' &&
      elapsed >= b.nextChangeAt &&
      flying < tuning.flyingBatCount
    ) {
      const toIdx = pickGlideTarget(rng, perches, b.perchIndex)
      b.glideFrom.copy(b.rig.root.position)
      b.glideTo.copy(perches[toIdx].position)
      b.glideFromYaw = b.rig.root.rotation.y
      b.glideToYaw = perches[toIdx].yaw
      b.perchIndex = toIdx
      b.state = 'glide'
      b.stateTime = 0
      b.glideDuration = 2.2 + rng() * 2.5
      flying++
    }

    if (b.state === 'hang') {
      applyBatHangPose(b.rig, b.wingPhase)
    } else {
      const u = THREE.MathUtils.clamp(b.stateTime / b.glideDuration, 0, 1)
      const e = u * u * (3 - 2 * u)
      b.rig.root.position.lerpVectors(b.glideFrom, b.glideTo, e)
      b.rig.root.position.y += Math.sin(u * Math.PI) * 0.42
      b.rig.root.rotation.y = THREE.MathUtils.lerp(b.glideFromYaw, b.glideToYaw, e)
      applyBatGlidePose(b.rig, u, b.wingPhase)
      if (u >= 1) {
        b.state = 'hang'
        b.stateTime = 0
        b.nextChangeAt = elapsed + 14 + rng() * 26
      }
    }
  }
}

export function disposeAviaryBats(bats: AviaryBat[], parent: THREE.Object3D) {
  for (const b of bats) parent.remove(b.rig.root)
  bats.length = 0
}
