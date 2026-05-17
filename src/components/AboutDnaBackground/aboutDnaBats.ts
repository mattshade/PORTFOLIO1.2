import * as THREE from 'three'
import {
  applyBatGlidePose,
  applyBatHangPose,
  createOrigamiBat,
  type BatRig,
} from '../OrigamiAboutBackground/origamiBat'
import { sampleFlightPath } from '../OrigamiAviaryBackground/craneMotion'
import { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'
import { isLine2Object } from '../OrigamiAviaryBackground/lineBatch'
import type { AboutDnaConfig } from './dnaConfig'
import { buildSpineSamples, spineAtU, type SpineSample } from './spinePath'

type Rng = ReturnType<typeof createMulberry32>

export type VineBatPerch = {
  position: THREE.Vector3
  yaw: number
}

const _pathPos = new THREE.Vector3()
const _tangent = new THREE.Vector3()

function applyBatLineOpacity(obj: THREE.Object3D, vis: number) {
  if (!isLine2Object(obj)) return
  const mat = obj.material
  const base = (mat.userData.baseOpacity as number | undefined) ?? mat.opacity
  mat.transparent = true
  mat.opacity = vis <= 0 ? 0 : base * vis
}

function batWorldScale(cfg: AboutDnaConfig): number {
  return cfg.helixRadius * cfg.scaleXZ * cfg.batScale
}

function setBatDrawOrder(rig: BatRig) {
  rig.root.renderOrder = 24
  rig.root.traverse((o) => {
    if (isLine2Object(o)) o.renderOrder = 24
  })
}

/** Landing sites along the vine, wrappers, and open air — like aviary tree perches. */
export function buildVineBatPerches(cfg: AboutDnaConfig, rng: Rng, spine: SpineSample[]): VineBatPerch[] {
  const perches: VineBatPerch[] = []
  if (spine.length === 0) return perches

  const pool = cfg.batPerchPool ?? 48

  for (let i = 0; i < pool; i++) {
    const u = 0.04 + rng() * 0.92
    const frame = spineAtU(spine, u)
    if (!frame?.center) continue
    const side = rng() > 0.5 ? 1 : -1
    const standoff = frame.radius * (1.6 + rng() * 2.4)
    const lift = (rng() - 0.35) * 1.1
    perches.push({
      position: new THREE.Vector3(
        frame.center.x + frame.normal.x * standoff * side,
        frame.center.y + frame.tangent.y * 0.15 + lift,
        frame.center.z + frame.normal.z * standoff * 0.45 * side + (rng() - 0.5) * 0.7,
      ),
      yaw: Math.atan2(frame.normal.x * side, frame.normal.z * side + 0.1),
    })
  }

  const { yMin, yMax } = (() => {
    let yMin = Infinity
    let yMax = -Infinity
    for (const s of spine) {
      yMin = Math.min(yMin, s.center.y)
      yMax = Math.max(yMax, s.center.y)
    }
    return { yMin, yMax }
  })()

  const midX = cfg.stalkOffsetX * cfg.scaleXZ
  for (let i = 0; i < 12; i++) {
    perches.push({
      position: new THREE.Vector3(
        midX + (rng() - 0.5) * 3.6,
        THREE.MathUtils.lerp(yMin, yMax, rng()),
        (rng() - 0.5) * 2.2 + 0.6,
      ),
      yaw: rng() * Math.PI * 2,
    })
  }

  return perches
}

function pickPerch(rng: Rng, perches: VineBatPerch[], avoid: number): number {
  if (perches.length <= 1) return 0
  const candidates = perches.map((_, i) => i).filter((i) => i !== avoid)
  return candidates[Math.floor(rng() * candidates.length)] ?? avoid
}

export type AboutDnaBat = {
  rig: BatRig
  state: 'rest' | 'fly'
  perchIndex: number
  stateTime: number
  nextDecisionAt: number
  wingPhase: number
  flightFrom: THREE.Vector3
  flightControl: THREE.Vector3
  flightTo: THREE.Vector3
  flightProgress: number
  flightDuration: number
}

function beginFlight(b: AboutDnaBat, from: THREE.Vector3, to: THREE.Vector3, rng: Rng) {
  b.flightFrom.copy(from)
  b.flightTo.copy(to)
  b.flightControl.set(
    (from.x + to.x) * 0.5 + (rng() - 0.5) * 2.2,
    Math.max(from.y, to.y) + 0.7 + rng() * 1.4,
    (from.z + to.z) * 0.5 + (rng() - 0.5) * 1.6,
  )
  b.flightProgress = 0
  b.flightDuration = 2.1 + rng() * 2.6
  b.state = 'fly'
  b.stateTime = 0
}

function restOnPerch(b: AboutDnaBat, perches: VineBatPerch[]) {
  const p = perches[b.perchIndex]
  b.rig.root.position.copy(p.position)
  b.rig.root.rotation.order = 'YXZ'
  b.rig.root.rotation.y = p.yaw
  applyBatHangPose(b.rig, b.wingPhase)
}

export function populateAboutDnaBats(
  parent: THREE.Object3D,
  rng: Rng,
  cfg: AboutDnaConfig,
  perches: VineBatPerch[],
  accent: THREE.Color,
  muted: THREE.Color,
  roots: THREE.Object3D[],
): AboutDnaBat[] {
  const bats: AboutDnaBat[] = []
  const total = Math.min(cfg.batCount + cfg.flyingBatCount, perches.length)
  const scale = batWorldScale(cfg)
  const used = new Set<number>()

  for (let i = 0; i < total; i++) {
    let idx = Math.floor(rng() * perches.length)
    for (let guard = 0; guard < 24 && used.has(idx); guard++) idx = Math.floor(rng() * perches.length)
    used.add(idx)

    const rig = createOrigamiBat(accent, muted, cfg.batLineOpacity, 1.35, 12, roots)
    rig.root.scale.setScalar(scale)
    setBatDrawOrder(rig)
    parent.add(rig.root)

    const bat: AboutDnaBat = {
      rig,
      state: 'rest',
      perchIndex: idx,
      stateTime: 0,
      nextDecisionAt: 4 + rng() * 14,
      wingPhase: rng() * Math.PI * 2,
      flightFrom: new THREE.Vector3(),
      flightControl: new THREE.Vector3(),
      flightTo: new THREE.Vector3(),
      flightProgress: 0,
      flightDuration: 1,
    }
    restOnPerch(bat, perches)
    bats.push(bat)
  }

  return bats
}

export function updateAboutDnaBats(
  bats: AboutDnaBat[],
  perches: VineBatPerch[],
  elapsed: number,
  delta: number,
  rng: Rng,
  reducedMotion: boolean,
  cfg: AboutDnaConfig,
  vineFade: number,
) {
  const batVis = THREE.MathUtils.clamp(vineFade, 0, 1)
  let flying = 0
  for (const b of bats) {
    if (b.state === 'fly') flying++
    b.rig.root.visible = batVis > 0.02
    b.rig.root.traverse((o) => applyBatLineOpacity(o, batVis))
  }

  if (batVis < 0.02) return

  for (const b of bats) {
    b.stateTime += delta
    b.wingPhase += delta * (b.state === 'fly' ? 2.2 : 0.85)

    if (
      !reducedMotion &&
      b.state === 'rest' &&
      elapsed >= b.nextDecisionAt &&
      flying < cfg.flyingBatCount &&
      perches.length > 1
    ) {
      const target = pickPerch(rng, perches, b.perchIndex)
      const dest = perches[target]?.position
      if (!dest) continue
      b.perchIndex = target
      beginFlight(b, b.rig.root.position.clone(), dest.clone(), rng)
      flying++
    }

    if (b.state === 'fly') {
      b.flightProgress += delta / b.flightDuration
      const u = THREE.MathUtils.clamp(b.flightProgress, 0, 1)
      sampleFlightPath(b.flightFrom, b.flightControl, b.flightTo, u, _pathPos, _tangent)
      b.rig.root.position.copy(_pathPos)
      b.rig.root.rotation.y = Math.atan2(_tangent.x, _tangent.z + 0.02)
      applyBatGlidePose(b.rig, u, b.wingPhase)

      if (u >= 1) {
        b.state = 'rest'
        b.stateTime = 0
        b.nextDecisionAt = elapsed + 6 + rng() * 18
        restOnPerch(b, perches)
        flying--
      }
    } else {
      restOnPerch(b, perches)
    }
  }
}

export function disposeAboutDnaBats(bats: AboutDnaBat[], parent: THREE.Object3D) {
  for (const b of bats) {
    parent.remove(b.rig.root)
  }
}
