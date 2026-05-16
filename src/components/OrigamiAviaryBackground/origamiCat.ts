import * as THREE from 'three'
import type { AviaryViewportProfile, OrigamiAviaryTuning } from './constants'
import { createLineBatch, flushLineBatch } from './lineBatch'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

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
  tick: (elapsed: number, delta: number, tuning: OrigamiAviaryTuning, reducedMotion: boolean) => void
  getPosition: (out: THREE.Vector3) => THREE.Vector3
  pounceAt: (target: THREE.Vector3, elapsed: number) => void
  isPouncing: () => boolean
  dispose: () => void
}

const _target = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _pounceFrom = new THREE.Vector3()
const _pounceTo = new THREE.Vector3()

type CatState =
  | 'stalking'
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
    return { far: -sceneDepth + 5.1, near: -7.75 }
  }
  if (viewport === 'tablet') {
    return { far: -sceneDepth + 3.6, near: -8.35 }
  }
  return { far: -sceneDepth + 2.85, near: -8.55 }
}

function clampCatZ(z: number, sceneDepth: number, viewport: AviaryViewportProfile) {
  const { far, near } = catZBounds(sceneDepth, viewport)
  return THREE.MathUtils.clamp(z, far, near)
}

function sanitizeCatRoot(rig: CatRig, state: CatState, t: OrigamiAviaryTuning) {
  const halfX = catWanderHalfX(t)
  rig.root.position.x = THREE.MathUtils.clamp(rig.root.position.x, -halfX, halfX)
  rig.root.position.z = clampCatZ(rig.root.position.z, t.sceneDepth, t.viewportProfile)
  if (state !== 'pounce') {
    rig.root.position.y = THREE.MathUtils.clamp(rig.root.position.y, 0.02, 0.14)
  }
}

export function createOrigamiCat(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  accent: THREE.Color,
  lineMuted: THREE.Color,
  roots: THREE.Object3D[],
): OrigamiCatSystem {
  const catColor = accent.clone().lerp(lineMuted, 0.62)
  const opacity = tuning.lineOpacity * 0.42
  const lineWidth = tuning.lineWidth * 0.72

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
  rig.root.scale.setScalar(1.35)
  rig.root.renderOrder = 2

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

  const randomGroundPoint = (out: THREE.Vector3, t: OrigamiAviaryTuning) => {
    const halfX = catWanderHalfX(t)
    out.set(
      (rng() - 0.5) * 2 * halfX,
      0.04 + rng() * 0.03,
      clampCatZ(-9.2 - rng() * (t.sceneDepth - 10.5), t.sceneDepth, t.viewportProfile),
    )
  }

  const pickWaypoint = (t: OrigamiAviaryTuning) => {
    randomGroundPoint(_target, t)
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
    if (state === 'crouch' || state === 'windup' || state === 'pounce') return
    aimPounce(target, 0.22 + rng() * 0.18, tuning)
    nextPounceAllowedAt = elapsed + 28 + rng() * 32
  }

  const isPouncing = () => state === 'crouch' || state === 'windup' || state === 'pounce'

  const getPosition = (out: THREE.Vector3) => out.copy(rig.root.position)

  randomGroundPoint(rig.root.position, tuning)
  rig.root.rotation.y = rng() * Math.PI * 2
  pickWaypoint(tuning)
  state = 'stalking'
  stateTime = 0

  const speed = 0.2

  const tick = (elapsed: number, delta: number, t: OrigamiAviaryTuning, reducedMotion: boolean) => {
    stateTime += delta
    const dt = reducedMotion ? 0 : delta

    if (state === 'stalking') {
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
    } else if (state === 'pounce') {
      const u = THREE.MathUtils.clamp(stateTime / stateDuration, 0, 1)
      const e = easeInOut(u)
      rig.root.position.lerpVectors(_pounceFrom, _pounceTo, e)
      rig.root.position.y = _pounceFrom.y + Math.sin(u * Math.PI) * 0.32
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

    sanitizeCatRoot(rig, state, t)

    const moving = state === 'stalking' && !stalkCreep
    const creeping = state === 'stalking' && stalkCreep
    walkPhase += dt * (moving ? 3.2 : creeping ? 1.6 : 0.45)
    tailPhase += dt * (state === 'windup' ? 4.5 : state === 'pounce' ? 2.2 : 1.1)
    headPhase += dt * 0.65

    const stride = moving ? Math.sin(walkPhase) : creeping ? Math.sin(walkPhase) * 0.18 : Math.sin(walkPhase * 0.35) * 0.22
    const strideOpp = moving ? Math.sin(walkPhase + Math.PI) : creeping ? Math.sin(walkPhase + Math.PI) * 0.18 : 0

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
    } else if (state === 'pounce') {
      const u = THREE.MathUtils.clamp(stateTime / stateDuration, 0, 1)
      rig.body.position.y = 0.03 + Math.sin(u * Math.PI) * 0.04
      rig.body.rotation.x = 0.04 + u * 0.08
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
        (moving ? Math.abs(Math.sin(walkPhase * 2)) * 0.018 : creeping ? 0.004 : 0.006)
      rig.body.rotation.x = creeping ? 0.13 + Math.sin(walkPhase * 1.5) * 0.02 : moving ? 0.06 + Math.sin(walkPhase * 2) * 0.02 : 0.1
      rig.body.rotation.z = creeping ? Math.sin(walkPhase * 0.8) * 0.015 : 0

      rig.legFL.rotation.x = stride * (creeping ? 0.22 : 0.35)
      rig.legBR.rotation.x = stride * (creeping ? 0.22 : 0.35)
      rig.legFR.rotation.x = strideOpp * (creeping ? 0.22 : 0.35)
      rig.legBL.rotation.x = strideOpp * (creeping ? 0.22 : 0.35)

      rig.tail.rotation.y = Math.sin(tailPhase) * (moving ? 0.22 : creeping ? 0.45 : 0.38)
      rig.tail.rotation.x = 0.12 + Math.sin(tailPhase * 0.7) * (creeping ? 0.14 : 0.08)

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

  return { rig, roots: catRoots, tick, getPosition, pounceAt, isPouncing, dispose }
}
