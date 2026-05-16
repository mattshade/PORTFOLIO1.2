import * as THREE from 'three'
import {
  CAT_TREE_TUNING,
  catVisibleMaxYForProfile,
  type AviaryViewportProfile,
  type OrigamiAviaryTuning,
} from './constants'
import type { Perch } from './environment'
import { createLineBatch, flushLineBatch } from './lineBatch'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type CatTickContext = {
  perches: Perch[]
  /** Finds a bird in leap range, scares via shared flee path, writes aim point for the leap arc. */
  attemptTreeLeapStrike: (catPos: THREE.Vector3, leapAimOut: THREE.Vector3) => boolean
}

function seg(batch: { positions: number[] }, ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  batch.positions.push(ax, ay, az, bx, by, bz)
}

export type CatRig = {
  root: THREE.Group
  body: THREE.Group
  head: THREE.Group
  tail: THREE.Group
  legFL: THREE.Group
  legFR: THREE.Group
  legBL: THREE.Group
  legBR: THREE.Group
}

export type OrigamiCatSystem = {
  rig: CatRig
  roots: THREE.Object3D[]
  tick: (
    elapsed: number,
    delta: number,
    tuning: OrigamiAviaryTuning,
    reducedMotion: boolean,
    ctx?: CatTickContext,
  ) => void
  getPosition: (out: THREE.Vector3) => THREE.Vector3
  pounceAt: (target: THREE.Vector3, elapsed: number) => void
  isPouncing: () => boolean
  /** Skip ground collision+pounce while climbing / tree leap (strike handled in-tree). */
  suppressCatBirdHandling: () => boolean
  dispose: () => void
}

const _target = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _pounceFrom = new THREE.Vector3()
const _pounceTo = new THREE.Vector3()
const _birdScratch = new THREE.Vector3()

type CatState =
  | 'stalking'
  | 'approach_tree'
  | 'climbing'
  | 'tree_descend'
  | 'tree_leap'
  | 'paused'
  | 'watching'
  | 'grooming'
  | 'stretching'
  | 'crouch'
  | 'windup'
  | 'pounce'
  | 'recover'

function easeInOut(t: number) {
  return t * t * (3 - 2 * t)
}

function buildCatLines(rig: CatRig, color: THREE.Color, opacity: number, lineWidth: number, roots: THREE.Object3D[], sceneDepth: number) {
  const lw = lineWidth * 0.85

  const bodyBatch = createLineBatch(opacity)
  seg(bodyBatch, 0, 0.06, 0.12, -0.14, 0.1, -0.1)
  seg(bodyBatch, -0.14, 0.1, -0.1, -0.1, 0.14, -0.08)
  seg(bodyBatch, -0.1, 0.14, -0.08, 0.1, 0.12, -0.06)
  seg(bodyBatch, 0.1, 0.12, -0.06, 0, 0.06, 0.12)
  seg(bodyBatch, 0, 0.1, 0, -0.12, 0.08, -0.04)
  flushLineBatch(bodyBatch, rig.body, color, roots, sceneDepth, lw)

  const headBatch = createLineBatch(opacity * 1.05)
  seg(headBatch, 0, 0, 0, 0.1, 0.05, 0.06)
  seg(headBatch, 0.1, 0.05, 0.06, 0.06, 0.1, 0.1)
  seg(headBatch, 0.06, 0.1, 0.1, -0.02, 0.08, 0.08)
  seg(headBatch, 0.04, 0.14, 0.1, 0.1, 0.12, 0.08)
  seg(headBatch, -0.02, 0.14, 0.1, 0.04, 0.14, 0.1)
  flushLineBatch(headBatch, rig.head, color, roots, sceneDepth, lw)

  const tailBatch = createLineBatch(opacity * 0.92)
  seg(tailBatch, 0, 0, 0, -0.08, 0.04, -0.06)
  seg(tailBatch, -0.08, 0.04, -0.06, -0.18, 0.1, -0.14)
  seg(tailBatch, -0.18, 0.1, -0.14, -0.32, 0.16, -0.22)
  seg(tailBatch, -0.32, 0.16, -0.22, -0.42, 0.12, -0.28)
  flushLineBatch(tailBatch, rig.tail, color, roots, sceneDepth, lw * 0.9)

  const leg = (parent: THREE.Group, sx: number, sz: number) => {
    const b = createLineBatch(opacity * 0.88)
    seg(b, 0, 0, 0, sx * 0.08, -0.1, sz * 0.06)
    seg(b, sx * 0.08, -0.1, sz * 0.06, sx * 0.1, -0.02, sz * 0.1)
    flushLineBatch(b, parent, color, roots, sceneDepth, lw * 0.75)
  }

  leg(rig.legFL, 1, 1)
  leg(rig.legFR, -1, 1)
  leg(rig.legBL, 1, -1)
  leg(rig.legBR, -1, -1)
}

/** Horizontal wander half-extent: keep inside frustum for portrait + parallax. */
function catWanderHalfX(t: OrigamiAviaryTuning): number {
  const base = t.forestHalfWidth * 1.55
  if (t.viewportProfile === 'narrow') return base * 0.36
  if (t.viewportProfile === 'tablet') return base * 0.58
  return base * 0.88
}

function catZBounds(sceneDepth: number, viewport: AviaryViewportProfile): { far: number; near: number } {
  // far = more negative (deeper); near = closer to camera — tighter on narrow to beat fog + clipping.
  if (viewport === 'narrow') {
    // Mid-ground band (closer to camera than deep forest) so wireframe reads through fog + vignette.
    return { far: -sceneDepth + 7.65, near: -5.95 }
  }
  if (viewport === 'tablet') {
    return { far: -sceneDepth + 4.2, near: -7.85 }
  }
  return { far: -sceneDepth + 3.15, near: -8.15 }
}

function clampCatZ(z: number, sceneDepth: number, viewport: AviaryViewportProfile) {
  const { far, near } = catZBounds(sceneDepth, viewport)
  return THREE.MathUtils.clamp(z, far, near)
}

function clampCatXZ(rig: CatRig, t: OrigamiAviaryTuning) {
  const halfX = catWanderHalfX(t)
  rig.root.position.x = THREE.MathUtils.clamp(rig.root.position.x, -halfX, halfX)
  rig.root.position.z = clampCatZ(rig.root.position.z, t.sceneDepth, t.viewportProfile)
}

function sanitizeCatRoot(
  rig: CatRig,
  state: CatState,
  t: OrigamiAviaryTuning,
  opts?: { climbTopY?: number },
) {
  const visY = catVisibleMaxYForProfile(t.viewportProfile)
  const { catGroundMinY, catGroundMaxY, catClimbSanitizeMargin } = CAT_TREE_TUNING

  clampCatXZ(rig, t)

  if (state === 'pounce' || state === 'tree_leap') {
    rig.root.position.y = THREE.MathUtils.clamp(rig.root.position.y, catGroundMinY, visY)
    return
  }
  if (state === 'tree_descend') {
    rig.root.position.y = THREE.MathUtils.clamp(rig.root.position.y, catGroundMinY, visY)
    return
  }
  if ((state === 'approach_tree' || state === 'climbing') && opts?.climbTopY !== undefined) {
    const yMax = Math.min(visY, opts.climbTopY + catClimbSanitizeMargin)
    rig.root.position.y = THREE.MathUtils.clamp(rig.root.position.y, catGroundMinY, yMax)
    return
  }
  rig.root.position.y = THREE.MathUtils.clamp(rig.root.position.y, catGroundMinY, catGroundMaxY)
}

function applyCatFrustumEdgeNudge(rig: CatRig, state: CatState, t: OrigamiAviaryTuning, dt: number) {
  if (t.viewportProfile !== 'narrow' || dt <= 0) return
  if (state === 'pounce' || state === 'tree_leap' || state === 'windup' || state === 'crouch') return

  const halfX = catWanderHalfX(t)
  const edge = CAT_TREE_TUNING.catFrustumEdgeNudgeStart
  const spd = CAT_TREE_TUNING.catFrustumEdgeNudgeSpeed

  const ax = Math.abs(rig.root.position.x) / Math.max(1e-5, halfX)
  if (ax > edge) {
    const w = (ax - edge) / Math.max(1e-5, 1 - edge)
    rig.root.position.x -= Math.sign(rig.root.position.x) * spd * dt * w * 0.42
  }

  const { far, near } = catZBounds(t.sceneDepth, t.viewportProfile)
  const zMid = (far + near) * 0.5
  const halfCorridor = (near - far) * 0.5
  const az = Math.abs(rig.root.position.z - zMid) / Math.max(1e-5, halfCorridor)
  if (az > edge) {
    const w = (az - edge) / Math.max(1e-5, 1 - edge)
    rig.root.position.z += Math.sign(zMid - rig.root.position.z) * spd * dt * w * 0.32
  }

  clampCatXZ(rig, t)
}

export function createOrigamiCat(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  accent: THREE.Color,
  lineMuted: THREE.Color,
  roots: THREE.Object3D[],
): OrigamiCatSystem {
  const catColor = accent.clone().lerp(lineMuted, 0.55)
  const opacityMul = tuning.viewportProfile === 'narrow' ? 0.78 : tuning.viewportProfile === 'tablet' ? 0.7 : 0.58
  const opacity = tuning.lineOpacity * opacityMul
  const lineWidth = tuning.lineWidth * (tuning.viewportProfile === 'narrow' ? 0.88 : 0.78)

  const rig: CatRig = {
    root: new THREE.Group(),
    body: new THREE.Group(),
    head: new THREE.Group(),
    tail: new THREE.Group(),
    legFL: new THREE.Group(),
    legFR: new THREE.Group(),
    legBL: new THREE.Group(),
    legBR: new THREE.Group(),
  }

  rig.head.position.set(0.12, 0.1, 0.1)
  rig.tail.position.set(-0.14, 0.1, -0.1)
  rig.legFL.position.set(0.08, 0.06, 0.06)
  rig.legFR.position.set(-0.08, 0.06, 0.06)
  rig.legBL.position.set(0.08, 0.06, -0.08)
  rig.legBR.position.set(-0.08, 0.06, -0.08)

  rig.body.add(rig.head, rig.tail, rig.legFL, rig.legFR, rig.legBL, rig.legBR)
  rig.root.add(rig.body)
  const rootScale =
    tuning.viewportProfile === 'narrow' ? 1.58 : tuning.viewportProfile === 'tablet' ? 1.46 : 1.35
  rig.root.scale.setScalar(rootScale)
  rig.root.renderOrder = 5

  const catRoots: THREE.Object3D[] = []
  buildCatLines(rig, catColor, opacity, lineWidth, catRoots, tuning.sceneDepth)
  roots.push(...catRoots)
  parent.add(rig.root)

  let state: CatState = 'paused'
  let stateTime = 0
  let stateDuration = 2 + rng() * 3
  let walkPhase = rng() * Math.PI * 2
  let tailPhase = rng() * Math.PI * 2
  let headPhase = rng() * Math.PI * 2
  let nextPounceAllowedAt = 5 + rng() * 8
  let pounceCount = 0
  let stalkCreep = false

  let climbPerchIndex = -1
  let climbEvaluateAccum = 0
  let climbHoldTime = 0
  let nextTreeClimbAllowedAt = 14 + rng() * 24

  const randomGroundPoint = (out: THREE.Vector3, t: OrigamiAviaryTuning) => {
    const halfX = catWanderHalfX(t)
    const { far, near } = catZBounds(t.sceneDepth, t.viewportProfile)
    // Sample inside the corridor. The old `-9.2 - rng*(sceneDepth-10.5)` map pinned ~70% of narrow
    // rolls to `far` after clamp — cat stuck in heaviest fog and read as invisible.
    const z = THREE.MathUtils.lerp(far, near, 0.2 + rng() * 0.75)
    const gy = CAT_TREE_TUNING.catSpawnGroundY
    out.set((rng() - 0.5) * 2 * halfX, gy, clampCatZ(z, t.sceneDepth, t.viewportProfile))
  }

  const pickWaypoint = (t: OrigamiAviaryTuning) => {
    randomGroundPoint(_target, t)
  }

  const tryPickTreeClimb = (ctx: CatTickContext, _t: OrigamiAviaryTuning) => {
    const cx = rig.root.position.x
    const cz = rig.root.position.z
    const candidates: number[] = []
    for (let i = 0; i < ctx.perches.length; i++) {
      if (ctx.perches[i].surface !== 'tree') continue
      const p = ctx.perches[i].position
      const h = Math.hypot(p.x - cx, p.z - cz)
      if (h > CAT_TREE_TUNING.minPerchPickDistanceXZ && h < CAT_TREE_TUNING.maxPerchPickDistanceXZ) {
        candidates.push(i)
      }
    }
    if (candidates.length === 0) return false
    climbPerchIndex = candidates[Math.floor(rng() * candidates.length)]!
    const perch = ctx.perches[climbPerchIndex]
    _target.set(perch.position.x, CAT_TREE_TUNING.catSpawnGroundY, perch.position.z)
    state = 'approach_tree'
    stateTime = 0
    stalkCreep = false
    climbHoldTime = 0
    rig.root.rotation.y = Math.atan2(perch.position.x - cx, perch.position.z - cz)
    return true
  }

  const pickPreyAhead = (out: THREE.Vector3, t: OrigamiAviaryTuning) => {
    const halfX = catWanderHalfX(t)
    const yaw = rig.root.rotation.y + (rng() - 0.5) * 0.35
    const dist = 1.05 + rng() * 0.85
    out.set(
      rig.root.position.x + Math.sin(yaw) * dist,
      rig.root.position.y,
      rig.root.position.z + Math.cos(yaw) * dist,
    )
    out.x = THREE.MathUtils.clamp(out.x, -halfX, halfX)
    out.z = clampCatZ(out.z, t.sceneDepth, t.viewportProfile)
  }

  const aimPounce = (target: THREE.Vector3, crouchDuration: number, t: OrigamiAviaryTuning) => {
    const halfX = catWanderHalfX(t)
    _pounceFrom.copy(rig.root.position)
    _pounceTo.copy(target)
    _pounceTo.y = _pounceFrom.y
    _dir.subVectors(_pounceTo, _pounceFrom)
    _dir.y = 0
    const len = _dir.length()
    if (len < 0.06) _dir.set((rng() - 0.5) * 0.35, 0, 0.85).normalize()
    else {
      _dir.normalize()
      if (len > 2.5) _pounceTo.copy(_pounceFrom).addScaledVector(_dir, 2.5)
    }
    _pounceTo.x = THREE.MathUtils.clamp(_pounceTo.x, -halfX, halfX)
    _pounceTo.z = clampCatZ(_pounceTo.z, t.sceneDepth, t.viewportProfile)
    rig.root.rotation.y = Math.atan2(_dir.x, _dir.z)
    state = 'crouch'
    stateTime = 0
    stateDuration = crouchDuration
    stalkCreep = false
    pounceCount += 1
  }

  const beginPounce = (t: OrigamiAviaryTuning) => {
    pickPreyAhead(_pounceTo, t)
    aimPounce(_pounceTo, 0.85 + rng() * 0.5, t)
  }

  const pounceAt = (target: THREE.Vector3, elapsed: number) => {
    if (
      state === 'crouch' ||
      state === 'windup' ||
      state === 'pounce' ||
      state === 'approach_tree' ||
      state === 'climbing' ||
      state === 'tree_descend' ||
      state === 'tree_leap'
    ) {
      return
    }
    aimPounce(target, 0.22 + rng() * 0.18, tuning)
    nextPounceAllowedAt = elapsed + 28 + rng() * 32
  }

  const isPouncing = () => state === 'crouch' || state === 'windup' || state === 'pounce'

  const suppressCatBirdHandling = () =>
    state === 'approach_tree' || state === 'climbing' || state === 'tree_descend' || state === 'tree_leap'

  const getPosition = (out: THREE.Vector3) => out.copy(rig.root.position)

  pickWaypoint(tuning)
  randomGroundPoint(rig.root.position, tuning)
  rig.root.position.y = CAT_TREE_TUNING.catSpawnGroundY
  rig.root.rotation.y = rng() * Math.PI * 2
  state = 'stalking'
  stateTime = 0
  sanitizeCatRoot(rig, state, tuning)

  const speed = 0.2

  const tick = (
    elapsed: number,
    delta: number,
    t: OrigamiAviaryTuning,
    reducedMotion: boolean,
    ctx?: CatTickContext,
  ) => {
    stateTime += delta
    const dt = reducedMotion ? 0 : delta

    // First moments after load: keep root Y pinned to ground so the rig never reads as floating
    // before stalking / idle motion runs (large first-frame delta or collision edge cases).
    if (elapsed < 0.28) {
      const pinGroundY =
        state === 'stalking' ||
        state === 'paused' ||
        state === 'watching' ||
        state === 'grooming' ||
        state === 'stretching' ||
        state === 'crouch' ||
        state === 'windup'
      if (pinGroundY) rig.root.position.y = CAT_TREE_TUNING.catSpawnGroundY
    }

    if (state === 'approach_tree' && ctx && climbPerchIndex >= 0) {
      const perch = ctx.perches[climbPerchIndex]
      _dir.set(perch.position.x - rig.root.position.x, 0, perch.position.z - rig.root.position.z)
      const dist = Math.hypot(_dir.x, _dir.z)
      if (dist < CAT_TREE_TUNING.approachXZThreshold) {
        state = 'climbing'
        stateTime = 0
        climbHoldTime = 0
      } else if (dt > 0) {
        _dir.normalize()
        const step = speed * dt * 0.92
        rig.root.position.x += _dir.x * step
        rig.root.position.z += _dir.z * step
        rig.root.rotation.y = Math.atan2(_dir.x, _dir.z)
      }
      rig.root.position.y = THREE.MathUtils.lerp(
        rig.root.position.y,
        CAT_TREE_TUNING.catSpawnGroundY,
        Math.min(1, dt * 5),
      )
    } else if (state === 'climbing' && ctx && climbPerchIndex >= 0) {
      const perch = ctx.perches[climbPerchIndex]
      const visCap = catVisibleMaxYForProfile(t.viewportProfile)
      const rawTop = Math.max(0.28, perch.position.y - CAT_TREE_TUNING.climbBelowPerch)
      const topY = Math.min(rawTop, visCap)
      _dir.set(perch.position.x - rig.root.position.x, 0, perch.position.z - rig.root.position.z)
      const flat = Math.hypot(_dir.x, _dir.z)
      if (flat > 1e-5 && dt > 0) {
        _dir.multiplyScalar(1 / flat)
        rig.root.position.x += _dir.x * CAT_TREE_TUNING.climbXZPull * dt
        rig.root.position.z += _dir.z * CAT_TREE_TUNING.climbXZPull * dt
      }
      if (dt > 0) {
        rig.root.position.y = Math.min(topY, rig.root.position.y + CAT_TREE_TUNING.climbRate * dt)
      }
      rig.root.rotation.y = Math.atan2(perch.position.x - rig.root.position.x, perch.position.z - rig.root.position.z)

      let struck = false
      if (dt > 0 && ctx.attemptTreeLeapStrike(rig.root.position, _birdScratch)) {
        struck = true
        _pounceFrom.copy(rig.root.position)
        _pounceTo.copy(_birdScratch)
        _pounceTo.y = CAT_TREE_TUNING.catSpawnGroundY + rng() * 0.018
        const halfX = catWanderHalfX(t)
        _pounceTo.x = THREE.MathUtils.clamp(_pounceTo.x, -halfX, halfX)
        _pounceTo.z = clampCatZ(_pounceTo.z, t.sceneDepth, t.viewportProfile)
        _dir.subVectors(_pounceTo, _pounceFrom)
        _dir.y = 0
        const flatLen = _dir.length()
        if (flatLen < 0.08) {
          _dir.set((rng() - 0.5) * 0.2, 0, 0.75)
          _dir.normalize()
          _pounceTo.copy(_pounceFrom).addScaledVector(_dir, 0.92)
        } else {
          _dir.multiplyScalar(1 / flatLen)
          if (flatLen > 2.35) _pounceTo.copy(_pounceFrom).addScaledVector(_dir, 2.35)
        }
        _pounceTo.y = CAT_TREE_TUNING.catSpawnGroundY + rng() * 0.018
        _pounceTo.x = THREE.MathUtils.clamp(_pounceTo.x, -halfX, halfX)
        _pounceTo.z = clampCatZ(_pounceTo.z, t.sceneDepth, t.viewportProfile)
        rig.root.rotation.y = Math.atan2(_pounceTo.x - _pounceFrom.x, _pounceTo.z - _pounceFrom.z)
        state = 'tree_leap'
        stateTime = 0
        stateDuration =
          CAT_TREE_TUNING.leapDurationMin +
          rng() * (CAT_TREE_TUNING.leapDurationMax - CAT_TREE_TUNING.leapDurationMin)
        nextTreeClimbAllowedAt =
          elapsed + CAT_TREE_TUNING.climbCooldownMin + rng() * (CAT_TREE_TUNING.climbCooldownMax - CAT_TREE_TUNING.climbCooldownMin)
        climbPerchIndex = -1
      }

      if (!struck && dt > 0) {
        if (rig.root.position.y >= topY - 0.028) {
          climbHoldTime += delta
          if (climbHoldTime > 2.05) {
            state = 'tree_descend'
            stateTime = 0
            climbHoldTime = 0
            climbPerchIndex = -1
            nextTreeClimbAllowedAt =
              elapsed + CAT_TREE_TUNING.climbCooldownMin * 0.65 + rng() * (CAT_TREE_TUNING.climbCooldownMax * 0.55)
          }
        } else {
          climbHoldTime = 0
        }
      }
    } else if (state === 'tree_descend' && dt > 0) {
      rig.root.position.y = THREE.MathUtils.lerp(
        rig.root.position.y,
        CAT_TREE_TUNING.catSpawnGroundY,
        Math.min(1, dt * 2.65),
      )
      if (rig.root.position.y <= 0.125) {
        state = 'stalking'
        stateTime = 0
        pickWaypoint(t)
      }
    } else if (state === 'stalking') {
      _dir.subVectors(_target, rig.root.position)
      _dir.y = 0
      const dist = _dir.length()
      stalkCreep = dist < 2.8 && dist > 0.4

      if (dist < 0.4) {
        const pounceChance = pounceCount === 0 ? 0.72 : 0.4
        if (elapsed >= nextPounceAllowedAt && rng() < pounceChance) {
          beginPounce(t)
          nextPounceAllowedAt = elapsed + 38 + rng() * 42
        } else {
          const roll = rng()
          if (roll < 0.48) {
            state = 'watching'
            stateDuration = 2.5 + rng() * 4
          } else if (roll < 0.68) {
            state = 'paused'
            stateDuration = 2 + rng() * 3.5
          } else if (roll < 0.82) {
            state = 'grooming'
            stateDuration = 1.8 + rng() * 2.2
          } else {
            state = 'stretching'
            stateDuration = 1.6 + rng() * 1.4
          }
          stateTime = 0
          stalkCreep = false
        }
      } else {
        _dir.normalize()
        const step = speed * dt * (stalkCreep ? 0.48 : 1)
        rig.root.position.x += _dir.x * step
        rig.root.position.z += _dir.z * step
        rig.root.rotation.y = Math.atan2(_dir.x, _dir.z)

        if (stalkCreep && elapsed >= nextPounceAllowedAt && dist < 2.2 && rng() < 0.018) {
          beginPounce(t)
          nextPounceAllowedAt = elapsed + 38 + rng() * 42
        }

        if (ctx && !reducedMotion && elapsed >= nextTreeClimbAllowedAt && dt > 0) {
          climbEvaluateAccum += delta
          if (climbEvaluateAccum >= CAT_TREE_TUNING.climbEvaluatePeriod) {
            climbEvaluateAccum = 0
            if (rng() < CAT_TREE_TUNING.climbPickChance && tryPickTreeClimb(ctx, t)) {
              nextTreeClimbAllowedAt =
                elapsed +
                CAT_TREE_TUNING.climbCooldownMin +
                rng() * (CAT_TREE_TUNING.climbCooldownMax - CAT_TREE_TUNING.climbCooldownMin)
            }
          }
        }
      }
    } else if (state === 'crouch') {
      if (stateTime >= stateDuration) {
        state = 'windup'
        stateTime = 0
        stateDuration = 0.72 + rng() * 0.45
      }
    } else if (state === 'windup') {
      if (stateTime >= stateDuration) {
        state = 'pounce'
        stateTime = 0
        stateDuration = 0.48 + rng() * 0.22
      }
    } else if (state === 'pounce' || state === 'tree_leap') {
      const u = THREE.MathUtils.clamp(stateTime / stateDuration, 0, 1)
      const e = easeInOut(u)
      rig.root.position.lerpVectors(_pounceFrom, _pounceTo, e)
      const arcNominal = state === 'tree_leap' ? CAT_TREE_TUNING.leapArcHeight : CAT_TREE_TUNING.pounceArcHeight
      const visCap = catVisibleMaxYForProfile(t.viewportProfile)
      const midBase = THREE.MathUtils.lerp(_pounceFrom.y, _pounceTo.y, easeInOut(0.5))
      const arc = Math.max(0, Math.min(arcNominal, visCap - midBase - 0.02))
      const baseY = THREE.MathUtils.lerp(_pounceFrom.y, _pounceTo.y, e)
      rig.root.position.y = baseY + Math.sin(u * Math.PI) * arc
      if (u >= 1) {
        state = 'recover'
        stateTime = 0
        stateDuration = 1.4 + rng() * 2.2
      }
    } else if (state === 'recover') {
      if (stateTime >= stateDuration) {
        state = 'paused'
        stateTime = 0
        stateDuration = 1.2 + rng() * 2
        pickWaypoint(t)
      }
    } else if (state === 'stretching') {
      if (stateTime >= stateDuration) {
        state = 'stalking'
        pickWaypoint(t)
        stateTime = 0
      }
    } else if (stateTime >= stateDuration) {
      const roll = rng()
      if (roll < 0.58) {
        state = 'stalking'
        pickWaypoint(t)
        stateTime = 0
      } else if (roll < 0.76) {
        state = 'grooming'
        stateDuration = 2 + rng() * 2.5
        stateTime = 0
      } else if (roll < 0.9) {
        state = 'watching'
        stateDuration = 3 + rng() * 5
        stateTime = 0
      } else {
        state = 'stretching'
        stateDuration = 1.4 + rng() * 1.6
        stateTime = 0
      }
    }

    let climbTopY: number | undefined
    if ((state === 'approach_tree' || state === 'climbing') && ctx && climbPerchIndex >= 0) {
      const py = ctx.perches[climbPerchIndex]?.position.y ?? 0
      const rawTop = Math.max(0.28, py - CAT_TREE_TUNING.climbBelowPerch)
      climbTopY = Math.min(rawTop, catVisibleMaxYForProfile(t.viewportProfile))
    }
    sanitizeCatRoot(rig, state, t, { climbTopY })
    applyCatFrustumEdgeNudge(rig, state, t, dt)

    const moving = state === 'stalking' && !stalkCreep
    const creeping = state === 'stalking' && stalkCreep
    const treeWalk = state === 'approach_tree'
    const treeClimbPose = state === 'climbing'
    const treeDescendPose = state === 'tree_descend'
    walkPhase += dt * (moving ? 3.2 : creeping ? 1.6 : treeWalk ? 2.35 : treeClimbPose ? 1.32 : treeDescendPose ? 1.85 : 0.45)
    tailPhase += dt * (state === 'windup' ? 4.5 : state === 'pounce' || state === 'tree_leap' ? 2.2 : 1.1)
    headPhase += dt * 0.65

    const stride = moving
      ? Math.sin(walkPhase)
      : creeping || treeWalk
        ? Math.sin(walkPhase) * 0.2
        : treeClimbPose || treeDescendPose
          ? Math.sin(walkPhase) * 0.26
          : Math.sin(walkPhase * 0.35) * 0.22
    const strideOpp = moving
      ? Math.sin(walkPhase + Math.PI)
      : creeping || treeWalk
        ? Math.sin(walkPhase + Math.PI) * 0.2
        : treeClimbPose || treeDescendPose
          ? Math.sin(walkPhase + Math.PI) * 0.26
          : 0

    if (state === 'crouch' || state === 'windup' || state === 'recover') {
      rig.body.position.y = 0.005
      rig.body.rotation.x = 0.16 + (state === 'windup' ? Math.sin(stateTime * 28) * 0.035 : 0)
      rig.body.rotation.z = state === 'windup' ? Math.sin(stateTime * 32) * 0.025 : 0
      rig.legFL.rotation.x = 0.55
      rig.legFR.rotation.x = 0.55
      rig.legBL.rotation.x = 0.45
      rig.legBR.rotation.x = 0.45
      rig.tail.rotation.x = 0.2
      rig.tail.rotation.y = Math.sin(tailPhase * 3) * (state === 'windup' ? 0.55 : 0.25)
      rig.head.rotation.x = 0.12
      rig.head.rotation.y = Math.sin(headPhase * 2) * 0.06
    } else if (state === 'pounce' || state === 'tree_leap') {
      const u = THREE.MathUtils.clamp(stateTime / stateDuration, 0, 1)
      rig.body.position.y = 0.03 + Math.sin(u * Math.PI) * 0.04
      rig.body.rotation.x = 0.04 + u * (state === 'tree_leap' ? 0.11 : 0.08)
      rig.legFL.rotation.x = 0.7
      rig.legFR.rotation.x = 0.7
      rig.legBL.rotation.x = -0.35
      rig.legBR.rotation.x = -0.35
      rig.tail.rotation.x = -0.15 + u * 0.25
      rig.tail.rotation.y = Math.sin(tailPhase) * 0.15
      rig.head.rotation.x = -0.08 + u * 0.15
    } else if (state === 'stretching') {
      const u = THREE.MathUtils.clamp(stateTime / stateDuration, 0, 1)
      const s = Math.sin(u * Math.PI)
      rig.body.position.y = 0.02 + s * 0.04
      rig.body.rotation.x = 0.04 - s * 0.12
      rig.tail.rotation.x = 0.05 - s * 0.2
      rig.head.rotation.x = -0.05 - s * 0.15
      rig.legFL.rotation.x = -s * 0.25
      rig.legBR.rotation.x = s * 0.2
    } else {
      rig.body.position.y =
        0.02 +
        (moving
          ? Math.abs(Math.sin(walkPhase * 2)) * 0.018
          : creeping || treeWalk
            ? 0.005
            : treeClimbPose || treeDescendPose
              ? Math.abs(Math.sin(walkPhase * 2)) * 0.024
              : 0.006)
      rig.body.rotation.x =
        creeping || treeWalk
          ? 0.13 + Math.sin(walkPhase * 1.5) * 0.02
          : treeClimbPose
            ? 0.38 + Math.sin(walkPhase * 1.65) * 0.035
            : treeDescendPose
              ? 0.16 + Math.sin(walkPhase * 1.4) * 0.022
              : moving
                ? 0.06 + Math.sin(walkPhase * 2) * 0.02
                : 0.1
      rig.body.rotation.z =
        creeping || treeWalk
          ? Math.sin(walkPhase * 0.8) * 0.015
          : treeClimbPose
            ? Math.sin(walkPhase * 0.55) * 0.028
            : 0

      const legMul = creeping || treeWalk ? 0.22 : treeClimbPose || treeDescendPose ? 0.3 : 0.35
      rig.legFL.rotation.x = stride * legMul
      rig.legBR.rotation.x = stride * legMul
      rig.legFR.rotation.x = strideOpp * legMul
      rig.legBL.rotation.x = strideOpp * legMul

      rig.tail.rotation.y = Math.sin(tailPhase) * (moving ? 0.22 : creeping || treeWalk ? 0.45 : treeClimbPose ? 0.52 : 0.38)
      rig.tail.rotation.x =
        0.12 + Math.sin(tailPhase * 0.7) * (creeping || treeWalk ? 0.14 : treeClimbPose ? 0.18 : 0.08)

      if (state === 'watching') {
        rig.head.rotation.y = Math.sin(headPhase * 0.5) * 0.35
        rig.head.rotation.x = 0.05 + Math.sin(headPhase * 0.35) * 0.06
      } else if (state === 'grooming') {
        rig.head.rotation.x = 0.35 + Math.sin(headPhase * 2) * 0.08
        rig.head.rotation.y = Math.sin(headPhase) * 0.12
      } else if (state === 'paused') {
        rig.head.rotation.y = Math.sin(headPhase * 0.4) * 0.22
        rig.head.rotation.x = 0.06 + Math.sin(headPhase * 1.8) * 0.04
      } else {
        rig.head.rotation.x = 0.04 + Math.sin(walkPhase) * 0.04
        rig.head.rotation.y = Math.sin(headPhase * 0.3) * 0.08
      }
    }
  }

  const dispose = () => {
    parent.remove(rig.root)
  }

  return { rig, roots: catRoots, tick, getPosition, pounceAt, isPouncing, suppressCatBirdHandling, dispose }
}
