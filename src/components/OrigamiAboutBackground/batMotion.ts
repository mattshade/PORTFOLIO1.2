import * as THREE from 'three'
import {
  applyBatGlidePose,
  applyBatHangPose,
  createOrigamiBat,
  type BatRig,
} from './origamiBat'
import type { AboutCavernConfig } from './aboutSceneConfig'
import type { BatPerch } from './cavernStructures'
import type { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type AboutBat = {
  rig: BatRig
  state: 'hang' | 'glide'
  stateTime: number
  nextChangeAt: number
  perchIndex: number
  glideFrom: THREE.Vector3
  glideTo: THREE.Vector3
  glideDuration: number
  wingPhase: number
}

export function populateAboutBats(
  parent: THREE.Object3D,
  rng: Rng,
  perches: BatPerch[],
  cfg: AboutCavernConfig,
  accent: THREE.Color,
  muted: THREE.Color,
  sceneDepth: number,
  roots: THREE.Object3D[],
): AboutBat[] {
  const bats: AboutBat[] = []
  const count = Math.min(cfg.batCount, perches.length)
  const used = new Set<number>()

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(rng() * perches.length)
    for (let guard = 0; guard < 20 && used.has(idx); guard++) idx = Math.floor(rng() * perches.length)
    used.add(idx)

    const rig = createOrigamiBat(accent, muted, cfg.edgeOpacity * 0.88, 1.18, sceneDepth, roots)
    rig.root.scale.setScalar(cfg.batScale)
    const p = perches[idx]
    rig.root.position.copy(p.position)
    rig.root.rotation.y = p.yaw
    applyBatHangPose(rig, rng() * Math.PI * 2)
    parent.add(rig.root)

    bats.push({
      rig,
      state: 'hang',
      stateTime: 0,
      nextChangeAt: 8 + rng() * 24,
      perchIndex: idx,
      glideFrom: p.position.clone(),
      glideTo: p.position.clone(),
      glideDuration: 2.8 + rng() * 2.2,
      wingPhase: rng() * Math.PI * 2,
    })
  }

  return bats
}

function pickGlideTarget(rng: Rng, perches: BatPerch[], avoid: number): number {
  const candidates = perches.map((_, i) => i).filter((i) => i !== avoid)
  return candidates[Math.floor(rng() * candidates.length)] ?? avoid
}

export function updateAboutBats(
  bats: AboutBat[],
  perches: BatPerch[],
  elapsed: number,
  delta: number,
  cfg: AboutCavernConfig,
  rng: Rng,
  reducedMotion: boolean,
  _depth: number,
) {
  let flying = 0
  for (const b of bats) {
    if (b.state === 'glide') flying++
  }

  for (const b of bats) {
    b.stateTime += delta
    b.wingPhase += delta * (b.state === 'glide' ? 2.4 : 0.9)

    if (!reducedMotion && b.state === 'hang' && elapsed >= b.nextChangeAt && flying < cfg.flyingBatCount) {
      const toIdx = pickGlideTarget(rng, perches, b.perchIndex)
      b.glideFrom.copy(b.rig.root.position)
      b.glideTo.copy(perches[toIdx].position)
      b.perchIndex = toIdx
      b.state = 'glide'
      b.stateTime = 0
      b.glideDuration = 2.6 + rng() * 2.4
      flying++
    }

    if (b.state === 'hang') {
      applyBatHangPose(b.rig, b.wingPhase)
    } else {
      const u = THREE.MathUtils.clamp(b.stateTime / b.glideDuration, 0, 1)
      const e = u * u * (3 - 2 * u)
      b.rig.root.position.lerpVectors(b.glideFrom, b.glideTo, e)
      b.rig.root.position.y += Math.sin(u * Math.PI) * 0.35
      applyBatGlidePose(b.rig, u, b.wingPhase)
      if (u >= 1) {
        b.state = 'hang'
        b.stateTime = 0
        b.nextChangeAt = elapsed + 12 + rng() * 28
      }
    }

    if (!b.rig.root.visible) continue
  }
}

export function disposeAboutBats(bats: AboutBat[], parent: THREE.Object3D) {
  bats.forEach((b) => parent.remove(b.rig.root))
}
