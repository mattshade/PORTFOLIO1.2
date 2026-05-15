import * as THREE from 'three'
import { createArticulatedOrigamiBird, type BirdRig } from './birdGeometry'
import type { OrigamiAviaryTuning } from './constants'
import { AVIARY_COLORS } from './constants'
import type { Perch } from './environment'
import { pointerOnPlaneZ } from './interaction'
import { BOTTOM_ANCHOR_CAMERA, scrollParallaxDrive } from './sceneAnchor'
import type { createMulberry32 } from './seededRandom'
import {
  applyBirdDepthCue,
  applyFoldedWings,
  applyRestingWingFlutter,
  applyWingFlap,
  applyWingUnfold,
  easeInOutCubic,
  easeInOutSine,
  flapRateForTuning,
  flightBankFromTangent,
  lerpAngle,
  lerpHeadGaze,
  smoothRotationYXZ,
  groundRestPose,
  perchRestPose,
  preenHeadPose,
  resetCraneLimbs,
  restingTailSway,
  sampleFlightPath,
} from './craneMotion'

type Rng = ReturnType<typeof createMulberry32>

export type CraneState =
  | 'resting'
  | 'preening'
  | 'takeoff'
  | 'flying'
  | 'landing'
  | 'settling'

export type FlightPhase = 'normal' | 'toViewer' | 'fromViewer'

export type AviaryBird = {
  rig: BirdRig
  kind: 'sculptural' | 'flock'
  state: CraneState
  stateTime: number
  stateDuration: number
  perchIndex: number
  perchIndexTarget: number
  nextDecisionAt: number
  flightFrom: THREE.Vector3
  flightControl: THREE.Vector3
  flightTo: THREE.Vector3
  flightProgress: number
  flightDuration: number
  flightPhase: FlightPhase
  approachEligible: boolean
  nextApproachAt: number
  approachCooldownUntil: number
  flapPhase: number
  flapPeriod: number
  pointerInfluence: number
  settleBlend: number
  preenDirection: 1 | -1
  depthSmooth: number
  catScareCooldownUntil: number
}

function anyBirdInApproach(birds: AviaryBird[]) {
  return birds.some((b) => b.flightPhase === 'toViewer' || b.flightPhase === 'fromViewer')
}

function approachPointNearCamera(rng: Rng, kind: AviaryBird['kind']) {
  const cam = BOTTOM_ANCHOR_CAMERA
  const zNear = kind === 'sculptural' ? 3.6 : 2.5
  return new THREE.Vector3(
    cam.x + (rng() - 0.5) * (kind === 'sculptural' ? 1.6 : 2.4),
    cam.y * 0.52 + rng() * 0.65,
    cam.z - zNear - rng() * 1.2,
  )
}

function pickPerch(rng: Rng, perches: Perch[], avoid: number): number {
  if (perches.length <= 1) return avoid === 0 ? 1 : 0
  const candidates = perches.map((_, i) => i).filter((i) => i !== avoid)
  const ground = candidates.filter((i) => perches[i].surface === 'ground')
  const tree = candidates.filter((i) => perches[i].surface === 'tree')
  const pool = rng() < 0.26 && ground.length > 0 ? ground : tree.length > 0 ? tree : candidates
  return pool[Math.floor(rng() * pool.length)]
}

function shuffleIndices(rng: Rng, indices: number[]) {
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function perchClearOfOthers(
  perches: Perch[],
  idx: number,
  placed: THREE.Vector3[],
  minDist: number,
) {
  const p = perches[idx].position
  for (const q of placed) {
    if (p.distanceTo(q) < minDist) return false
  }
  return true
}

/** Tree perches only on load; random order with minimum spacing between birds. */
function pickInitialPerch(
  rng: Rng,
  perches: Perch[],
  used: Set<number>,
  placed: THREE.Vector3[],
  forestHalfWidth: number,
  kind: AviaryBird['kind'],
): number {
  const minDist = kind === 'sculptural' ? 2.35 : 1.45
  const minCenterX = forestHalfWidth * 0.12

  let candidates = perches
    .map((_, i) => i)
    .filter((i) => !used.has(i) && perches[i].surface === 'tree')
    .filter((i) => perchClearOfOthers(perches, i, placed, minDist))

  if (kind === 'sculptural') {
    const offCenter = candidates.filter((i) => Math.abs(perches[i].position.x) >= minCenterX)
    if (offCenter.length > 0) candidates = offCenter
  }

  shuffleIndices(rng, candidates)
  if (candidates.length > 0) return candidates[0]

  const fallback = perches
    .map((_, i) => i)
    .filter((i) => !used.has(i) && perches[i].surface === 'tree')
  shuffleIndices(rng, fallback)
  return fallback[0] ?? 0
}

function scheduleIdleRest(
  rng: Rng,
  elapsed: number,
  perch: Perch,
  kind: AviaryBird['kind'],
) {
  if (perch.surface === 'ground') {
    return scheduleRest(rng, elapsed, 1, 3.2)
  }
  return scheduleRest(rng, elapsed, kind === 'sculptural' ? 4 : 2.5, kind === 'sculptural' ? 14 : 8)
}

function applyPerchPose(rig: BirdRig, perch: Perch) {
  if (perch.surface === 'ground') groundRestPose(rig)
  else perchRestPose(rig)
}

function scheduleRest(rng: Rng, elapsed: number, min: number, max: number) {
  return elapsed + min + rng() * (max - min)
}

function beginFlight(b: AviaryBird, from: THREE.Vector3, to: THREE.Vector3, rng: Rng) {
  b.flightPhase = 'normal'
  b.flightFrom.copy(from)
  b.flightTo.copy(to)
  b.flightControl.set(
    (from.x + to.x) * 0.5 + (rng() - 0.5) * 1.4,
    Math.max(from.y, to.y) + 0.6 + rng() * 0.5,
    (from.z + to.z) * 0.5 + (rng() - 0.5) * 0.8,
  )
  b.flightProgress = 0
  b.flightDuration = (b.kind === 'sculptural' ? 3.4 : 2.6) + rng() * 2.2
  b.flapPhase = rng()
  b.flapPeriod = 0.24 + rng() * 0.1
}

function beginApproachToViewer(b: AviaryBird, from: THREE.Vector3, rng: Rng) {
  const to = approachPointNearCamera(rng, b.kind)
  b.flightPhase = 'toViewer'
  b.flightFrom.copy(from)
  b.flightTo.copy(to)
  b.flightControl.set(
    from.x * 0.25 + to.x * 0.75 + (rng() - 0.5) * 0.6,
    Math.max(from.y, to.y) + 1.1 + rng() * 0.55,
    from.z * 0.35 + to.z * 0.65 + 1.2,
  )
  b.flightProgress = 0
  b.flightDuration = 2.1 + rng() * 0.75
  b.flapPhase = rng()
  b.flapPeriod = 0.2 + rng() * 0.08
}

function beginRetreatFromViewer(b: AviaryBird, from: THREE.Vector3, to: THREE.Vector3, rng: Rng) {
  b.flightPhase = 'fromViewer'
  b.flightFrom.copy(from)
  b.flightTo.copy(to)
  b.flightControl.set(
    from.x * 0.4 + to.x * 0.6 + (rng() - 0.5) * 1.2,
    Math.max(from.y, to.y) + 0.75 + rng() * 0.45,
    (from.z + to.z) * 0.5 - 1.4 - rng() * 0.5,
  )
  b.flightProgress = 0
  b.flightDuration = 2.3 + rng() * 1.1
  b.flapPhase = rng()
  b.flapPeriod = 0.22 + rng() * 0.09
}

function tryBeginViewerApproach(
  b: AviaryBird,
  birds: AviaryBird[],
  perches: Perch[],
  elapsed: number,
  rng: Rng,
): boolean {
  if (
    !b.approachEligible ||
    elapsed < b.nextApproachAt ||
    elapsed < b.approachCooldownUntil ||
    anyBirdInApproach(birds)
  ) {
    return false
  }

  const target = pickPerch(rng, perches, b.perchIndex)
  b.perchIndexTarget = target
  beginApproachToViewer(b, b.rig.root.position.clone(), rng)
  enterState(b, 'takeoff', 0.45 + rng() * 0.22)
  b.nextApproachAt = elapsed + 38 + rng() * 45
  b.approachCooldownUntil = elapsed + 12
  return true
}

function enterState(b: AviaryBird, state: CraneState, duration: number) {
  b.state = state
  b.stateTime = 0
  b.stateDuration = duration
}

function initRigScale(rig: BirdRig, scale: number) {
  rig.root.scale.setScalar(scale)
  rig.root.userData.baseScale = scale
  rig.root.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshBasicMaterial) {
      o.userData.baseFill = o.material.opacity
    }
  })
}

export function populateAviaryBirds(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  perches: Perch[],
): AviaryBird[] {
  const birds: AviaryBird[] = []
  const fill = AVIARY_COLORS.birdFill
  const accent = tuning.accentColor
  const used = new Set<number>()
  const placedPositions: THREE.Vector3[] = []

  type SpawnSpec = { kind: AviaryBird['kind']; scale: number }
  const spawns: SpawnSpec[] = []
  for (let i = 0; i < tuning.sculpturalBirdCount; i++) {
    spawns.push({ kind: 'sculptural', scale: 2.5 + rng() * 0.55 })
  }
  for (let i = 0; i < tuning.birdCount; i++) {
    spawns.push({ kind: 'flock', scale: 0.92 + rng() * 0.38 })
  }
  for (let i = spawns.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[spawns[i], spawns[j]] = [spawns[j], spawns[i]]
  }

  const makeBird = (
    rig: BirdRig,
    kind: AviaryBird['kind'],
    perchIndex: number,
    scale: number,
    extras: Partial<AviaryBird>,
  ): AviaryBird => {
    resetCraneLimbs(rig)
    initRigScale(rig, scale)
    const p = perches[perchIndex]
    rig.root.position.copy(p.position)
    rig.root.rotation.order = 'YXZ'
    rig.root.rotation.set(0, p.yaw, 0)
    rig.root.renderOrder = 5
    parent.add(rig.root)

    return {
      rig,
      kind,
      state: 'resting',
      stateTime: rng() * 12,
      stateDuration: 0,
      perchIndex,
      perchIndexTarget: perchIndex,
      nextDecisionAt: scheduleIdleRest(rng, 0, p, kind),
      flightFrom: new THREE.Vector3(),
      flightControl: new THREE.Vector3(),
      flightTo: new THREE.Vector3(),
      flightProgress: 0,
      flightDuration: 1,
      flightPhase: 'normal',
      approachEligible: rng() > 0.4,
      nextApproachAt: scheduleRest(rng, 0, 5, 16),
      approachCooldownUntil: 0,
      flapPhase: rng(),
      flapPeriod: flapRateForTuning(tuning),
      pointerInfluence: tuning.pointerInfluence * (kind === 'sculptural' ? 0.65 : 0.85),
      settleBlend: 0,
      preenDirection: rng() > 0.5 ? 1 : -1,
      depthSmooth: 0.5,
      catScareCooldownUntil: 0,
      ...extras,
    }
  }

  for (const spec of spawns) {
    const pi = pickInitialPerch(rng, perches, used, placedPositions, tuning.forestHalfWidth, spec.kind)
    used.add(pi)
    placedPositions.push(perches[pi].position.clone())
    const rig = createArticulatedOrigamiBird(fill, accent, spec.kind)
    birds.push(makeBird(rig, spec.kind, pi, spec.scale, {}))
  }

  return birds
}

const _gaze = new THREE.Vector3()
const _gazeDir = new THREE.Vector3()
const _pathPos = new THREE.Vector3()
const _tangent = new THREE.Vector3()

function applyGaze(rig: BirdRig, b: AviaryBird, pointerNdc: THREE.Vector2, camera: THREE.PerspectiveCamera, delta: number) {
  pointerOnPlaneZ(pointerNdc, camera, rig.root.position.z, _gaze)
  _gazeDir.subVectors(_gaze, rig.root.position)
  const gazeYaw = Math.atan2(_gazeDir.x, _gazeDir.z) * b.pointerInfluence * 0.07
  const gazePitch = Math.atan2(_gazeDir.y, Math.hypot(_gazeDir.x, _gazeDir.z)) * b.pointerInfluence * 0.045
  lerpHeadGaze(
    rig,
    THREE.MathUtils.clamp(gazePitch * 0.25, -0.1, 0.12),
    gazeYaw * 0.2,
    THREE.MathUtils.clamp(0.55 + gazePitch * 0.15, 0.4, 0.75),
    delta,
    2.2,
  )
}

function placeOnPerch(rig: BirdRig, perch: Perch, scrollLift: number) {
  rig.root.position.set(perch.position.x, perch.position.y + scrollLift, perch.position.z)
  rig.root.rotation.order = 'YXZ'
  rig.root.rotation.set(0, perch.yaw, 0)
}

function chooseBirdAction(
  b: AviaryBird,
  birds: AviaryBird[],
  elapsed: number,
  rng: Rng,
  perches: Perch[],
) {
  if (perches.length < 2) return
  const roll = rng()
  if (roll < 0.11 && tryBeginViewerApproach(b, birds, perches, elapsed, rng)) return

  const flyChance = b.kind === 'sculptural' ? 0.34 : 0.42
  if (roll < 0.11 + flyChance) {
    const target = pickPerch(rng, perches, b.perchIndex)
    b.perchIndexTarget = target
    beginFlight(b, b.rig.root.position.clone(), perches[target].position.clone(), rng)
    enterState(b, 'takeoff', 0.5 + rng() * 0.28)
  } else if (roll < 0.86) {
    enterState(b, 'preening', 1.6 + rng() * 2.4)
    b.preenDirection = rng() > 0.5 ? 1 : -1
  } else {
    b.nextDecisionAt = scheduleIdleRest(rng, elapsed, perches[b.perchIndex], b.kind)
  }
}

function updateBird(
  b: AviaryBird,
  birds: AviaryBird[],
  perches: Perch[],
  elapsed: number,
  delta: number,
  rng: Rng,
  ai: number,
  tuning: OrigamiAviaryTuning,
  pointerNdc: THREE.Vector2,
  camera: THREE.PerspectiveCamera,
  scrollLift: number,
) {
  const rig = b.rig
  b.stateTime += delta
  const perch = perches[b.perchIndex]
  const flapI = ai * tuning.wingFlutterIntensity

  switch (b.state) {
    case 'resting': {
      placeOnPerch(rig, perch, scrollLift)
      applyPerchPose(rig, perch)
      b.flapPhase += delta / (b.flapPeriod * 3.4)
      applyRestingWingFlutter(rig, b.flapPhase, flapI * 0.32)
      if (elapsed >= b.nextDecisionAt) {
        if (!tryBeginViewerApproach(b, birds, perches, elapsed, rng)) {
          chooseBirdAction(b, birds, elapsed, rng, perches)
        }
      }
      applyGaze(rig, b, pointerNdc, camera, delta)
      break
    }

    case 'preening': {
      placeOnPerch(rig, perch, scrollLift)
      const t = THREE.MathUtils.clamp(b.stateTime / b.stateDuration, 0, 1)
      const cycle = t < 0.5 ? t * 2 : 2 - t * 2
      preenHeadPose(rig, cycle)
      applyFoldedWings(rig, 1)
      restingTailSway(rig, cycle * 0.06 * b.preenDirection)
      if (b.stateTime >= b.stateDuration) {
        enterState(b, 'resting', 0)
        resetCraneLimbs(rig)
        b.nextDecisionAt = scheduleIdleRest(rng, elapsed, perch, b.kind)
      }
      break
    }

    case 'takeoff': {
      const u = THREE.MathUtils.clamp(b.stateTime / b.stateDuration, 0, 1)
      const lift = easeInOutCubic(u)
      rig.root.position.set(b.flightFrom.x, b.flightFrom.y + lift * 0.24 + scrollLift, b.flightFrom.z)
      if (lift < 0.4) {
        applyWingUnfold(rig, lift / 0.4)
      } else {
        b.flapPhase += delta / (b.flapPeriod * 0.85)
        applyWingFlap(rig, b.flapPhase, THREE.MathUtils.lerp(0.35, 1, (lift - 0.4) / 0.6) * flapI)
      }
      rig.neck.rotation.x = THREE.MathUtils.lerp(-0.06, -0.2, lift)
      if (b.stateTime >= b.stateDuration) {
        enterState(b, 'flying', b.flightDuration)
        b.flightProgress = 0
      }
      break
    }

    case 'flying': {
      b.flightProgress += delta / b.flightDuration
      const u = THREE.MathUtils.clamp(b.flightProgress, 0, 1)
      const e = easeInOutCubic(u)

      sampleFlightPath(b.flightFrom, b.flightControl, b.flightTo, e, _pathPos, _tangent)
      rig.root.position.set(_pathPos.x, _pathPos.y + scrollLift, _pathPos.z)

      const { yaw, pitch, bank } = flightBankFromTangent(_tangent, u)
      const turnSpeed = b.kind === 'sculptural' ? 2.85 : 3.65
      smoothRotationYXZ(rig.root.rotation, pitch, yaw, bank, delta, turnSpeed)

      b.flapPhase += delta / b.flapPeriod
      applyWingFlap(rig, b.flapPhase, flapI)
      rig.neck.rotation.x = -0.14 + Math.sin(b.flapPhase * Math.PI * 2) * 0.05
      rig.tail.rotation.x = 0.08 + Math.sin(b.flapPhase * Math.PI * 2 + 0.4) * 0.06

      if (b.flightPhase === 'toViewer' && u >= 0.9) {
        const near = rig.root.position.clone()
        const targetPos = perches[b.perchIndexTarget].position.clone()
        beginRetreatFromViewer(b, near, targetPos, rng)
      } else if (b.flightPhase === 'fromViewer' && u >= 0.82) {
        b.flightPhase = 'normal'
        enterState(b, 'landing', Math.max(0.35, (1 - u) * b.flightDuration))
      } else if (b.flightPhase === 'normal' && u >= 0.82) {
        enterState(b, 'landing', Math.max(0.35, (1 - u) * b.flightDuration))
      }
      break
    }

    case 'landing': {
      b.flightProgress += delta / b.flightDuration
      const u = THREE.MathUtils.clamp(b.flightProgress, 0, 1)
      const e = easeInOutCubic(u)

      sampleFlightPath(b.flightFrom, b.flightControl, b.flightTo, e, _pathPos, _tangent)
      rig.root.position.set(_pathPos.x, _pathPos.y + scrollLift, _pathPos.z)

      const targetPerch = perches[b.perchIndexTarget]
      const { yaw: pathYaw, pitch, bank } = flightBankFromTangent(_tangent, u)
      const settle = THREE.MathUtils.clamp((u - 0.72) / 0.28, 0, 1)
      const settleEased = easeInOutSine(settle)
      const targetPitch = pitch * (1 - settleEased)
      const targetYaw = lerpAngle(pathYaw, targetPerch.yaw, settleEased)
      const targetBank = bank * (1 - settleEased)
      smoothRotationYXZ(rig.root.rotation, targetPitch, targetYaw, targetBank, delta, 2.15)

      b.flapPhase += delta / (b.flapPeriod * 1.2)
      applyWingFlap(rig, b.flapPhase, flapI * (1 - settle * 0.75))

      if (u >= 1) {
        b.perchIndex = b.perchIndexTarget
        enterState(b, 'settling', 0.55 + rng() * 0.35)
        b.settleBlend = 0
      }
      break
    }

    case 'settling': {
      const target = perches[b.perchIndex]
      const u = THREE.MathUtils.clamp(b.stateTime / b.stateDuration, 0, 1)
      b.settleBlend = easeInOutCubic(u)

      _pathPos.set(target.position.x, target.position.y + scrollLift, target.position.z)
      rig.root.position.lerp(_pathPos, b.settleBlend * 0.4)
      smoothRotationYXZ(rig.root.rotation, 0, target.yaw, 0, delta, 2.35)
      if (target.surface === 'ground') {
        const blend = b.settleBlend
        applyFoldedWings(rig, blend)
        rig.body.rotation.x = THREE.MathUtils.lerp(-0.14, 0.1, blend)
        rig.neck.rotation.x = THREE.MathUtils.lerp(-0.14, 0.06, blend)
        rig.head.rotation.x = THREE.MathUtils.lerp(0.55, 0.4, blend)
      } else {
        applyFoldedWings(rig, b.settleBlend)
        rig.neck.rotation.x = THREE.MathUtils.lerp(-0.14, -0.06, b.settleBlend)
      }

      if (b.stateTime >= b.stateDuration) {
        enterState(b, 'resting', 0)
        placeOnPerch(rig, target, scrollLift)
        applyPerchPose(rig, target)
        b.nextDecisionAt = scheduleIdleRest(rng, elapsed, target, b.kind)
      }
      break
    }
  }

  b.depthSmooth = applyBirdDepthCue(rig, rig.root.position.z, tuning.sceneDepth, b.depthSmooth, delta)
}

export function updateAviaryBirds(
  birds: AviaryBird[],
  perches: Perch[],
  elapsed: number,
  delta: number,
  reducedMotion: boolean,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  pointerNdc: THREE.Vector2,
  camera: THREE.PerspectiveCamera,
  scrollNorm: number,
) {
  const ai = tuning.animationIntensity
  const scrollLift = scrollParallaxDrive(scrollNorm) * tuning.scrollDriftIntensity * 0.02

  for (const b of birds) {
    if (b.rig.edgeMats[0] && b.rig.edgeMats[0].userData.baseOpacity === undefined) {
      b.rig.edgeMats.forEach((m) => {
        m.userData.baseOpacity = m.opacity
      })
    }

    if (reducedMotion) {
      const p = perches[b.perchIndex]
      placeOnPerch(b.rig, p, scrollLift)
      applyPerchPose(b.rig, p)
      b.depthSmooth = applyBirdDepthCue(b.rig, b.rig.root.position.z, tuning.sceneDepth, b.depthSmooth, delta)
      continue
    }

    updateBird(b, birds, perches, elapsed, delta, rng, ai, tuning, pointerNdc, camera, scrollLift)
  }
}

const _catBirdDelta = new THREE.Vector3()
const _fleeFrom = new THREE.Vector3()

function pickFleePerch(rng: Rng, perches: Perch[], avoid: number, catPos: THREE.Vector3): number {
  const ranked = perches
    .map((p, i) => ({ i, d: p.position.distanceTo(catPos) }))
    .filter(({ i }) => i !== avoid)
    .sort((a, b) => b.d - a.d)
  if (ranked.length === 0) return avoid === 0 ? 1 : 0
  const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length * 0.4)))
  return pool[Math.floor(rng() * pool.length)].i
}

function birdNearCat(b: AviaryBird, catPos: THREE.Vector3): boolean {
  const bp = b.rig.root.position
  const scale = b.rig.root.scale.x
  const reach = 0.88 + (b.kind === 'sculptural' ? 1.05 : 0.68) * scale
  const horiz = Math.hypot(bp.x - catPos.x, bp.z - catPos.z)
  const vert = Math.abs(bp.y - catPos.y)
  return horiz < reach && vert < 2.5 + scale * 0.45
}

function scareBirdFromCat(
  b: AviaryBird,
  perches: Perch[],
  catPos: THREE.Vector3,
  rng: Rng,
  elapsed: number,
): boolean {
  if (b.state === 'flying' || b.state === 'takeoff') return false

  const targetIdx = pickFleePerch(rng, perches, b.perchIndex, catPos)
  b.perchIndexTarget = targetIdx
  _fleeFrom.copy(b.rig.root.position)
  const to = perches[targetIdx].position

  b.flightPhase = 'normal'
  b.flightFrom.copy(_fleeFrom)
  b.flightTo.copy(to)

  const awayX = _fleeFrom.x - catPos.x
  const awayZ = _fleeFrom.z - catPos.z
  const awayLen = Math.hypot(awayX, awayZ) || 1
  b.flightControl.set(
    _fleeFrom.x + (awayX / awayLen) * (2.1 + rng() * 0.75) + (rng() - 0.5) * 0.85,
    Math.max(_fleeFrom.y, to.y) + 1.1 + rng() * 0.85,
    _fleeFrom.z + (awayZ / awayLen) * (1.35 + rng() * 0.55) + (rng() - 0.5) * 0.65,
  )
  b.flightProgress = 0
  b.flightDuration = (b.kind === 'sculptural' ? 2.5 : 1.85) + rng() * 1.15
  b.flapPhase = rng()
  b.flapPeriod = 0.16 + rng() * 0.06

  enterState(b, 'takeoff', 0.26 + rng() * 0.14)
  b.nextDecisionAt = elapsed + 26 + rng() * 30
  b.approachCooldownUntil = elapsed + 16
  b.catScareCooldownUntil = elapsed + 9 + rng() * 7
  return true
}

export function handleCatBirdCollisions(
  catPos: THREE.Vector3,
  pounceAt: (target: THREE.Vector3) => void,
  isCatPouncing: () => boolean,
  birds: AviaryBird[],
  perches: Perch[],
  rng: Rng,
  elapsed: number,
) {
  if (isCatPouncing()) return

  let prey: AviaryBird | null = null
  let preyDist = Infinity

  for (const b of birds) {
    if (elapsed < b.catScareCooldownUntil) continue
    if (!birdNearCat(b, catPos)) continue
    const bp = b.rig.root.position
    const horiz = Math.hypot(bp.x - catPos.x, bp.z - catPos.z)
    if (horiz < preyDist) {
      preyDist = horiz
      prey = b
    }
  }

  if (!prey) return

  for (const b of birds) {
    if (elapsed < b.catScareCooldownUntil) continue
    if (!birdNearCat(b, catPos)) continue
    scareBirdFromCat(b, perches, catPos, rng, elapsed)
  }

  _catBirdDelta.copy(prey.rig.root.position)
  pounceAt(_catBirdDelta)
}

export function disposeAviaryBirds(birds: AviaryBird[], parent: THREE.Object3D) {
  birds.forEach((b) => {
    parent.remove(b.rig.root)
    b.rig.root.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
        o.geometry?.dispose()
        const m = o.material
        if (Array.isArray(m)) m.forEach((x) => x.dispose())
        else m?.dispose()
      }
    })
  })
}
