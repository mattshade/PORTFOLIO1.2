import * as THREE from 'three'
import type { BirdRig } from './birdGeometry'
import type { OrigamiAviaryTuning } from './constants'

/** Wings folded down along body while perched */
export function applyFoldedWings(rig: BirdRig, blend = 1) {
  const fold = THREE.MathUtils.lerp(rig.wingSpreadAngle, rig.wingFoldRest, blend)
  rig.leftWing.rotation.set(fold, 0, 0.06 * blend)
  rig.rightWing.rotation.set(fold, 0, -0.06 * blend)
}

/** Reference spread pose — wings up and out */
export function applySpreadWings(rig: BirdRig, blend = 1) {
  const spread = rig.wingSpreadAngle * blend + rig.wingFoldRest * (1 - blend)
  rig.leftWing.rotation.set(spread, 0, 0)
  rig.rightWing.rotation.set(spread, 0, 0)
}

/** Subtle wing adjust while perched — folded with a slow open-close */
export function applyRestingWingFlutter(rig: BirdRig, phase: number, intensity: number) {
  if (intensity <= 0) {
    applyFoldedWings(rig, 1)
    return
  }
  const s = Math.sin(phase * Math.PI * 2)
  const open = Math.max(0, s) ** 2 * 0.18 * intensity
  const angle = rig.wingFoldRest - open
  const roll = 0.06 + open * 0.4
  rig.leftWing.rotation.set(angle, 0, roll)
  rig.rightWing.rotation.set(angle, 0, -roll)
}

/** Flap about the shoulder hinge (rotation.x) — wide stroke for flight */
export function applyWingFlap(rig: BirdRig, phase: number, intensity: number) {
  if (intensity <= 0) {
    applySpreadWings(rig, 1)
    return
  }
  const p = ((phase % 1) + 1) % 1
  let lift: number
  if (p < 0.32) {
    lift = (p / 0.32) ** 1.55
  } else {
    const t = (p - 0.32) / 0.68
    lift = 1 - t * t * (3 - 2 * t)
  }
  const down = THREE.MathUtils.lerp(rig.wingSpreadAngle, rig.wingFoldRest, 0.22)
  const up = rig.wingSpreadAngle - 0.26
  const flapX = THREE.MathUtils.lerp(down, up, lift)
  const angle = THREE.MathUtils.lerp(rig.wingSpreadAngle, flapX, intensity)
  const roll = Math.sin(p * Math.PI * 2) * 0.09 * intensity
  rig.leftWing.rotation.set(angle, 0, roll)
  rig.rightWing.rotation.set(angle, 0, -roll)
}

export function applyWingUnfold(rig: BirdRig, t: number) {
  const u = THREE.MathUtils.clamp(t, 0, 1)
  const angle = THREE.MathUtils.lerp(rig.wingFoldRest, rig.wingSpreadAngle, u)
  rig.leftWing.rotation.set(angle, 0, THREE.MathUtils.lerp(0.06, 0, u))
  rig.rightWing.rotation.set(angle, 0, THREE.MathUtils.lerp(-0.06, 0, u))
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function quadBezier(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
) {
  const u = 1 - t
  out.set(
    u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z,
  )
}

const _pathAhead = new THREE.Vector3()
const _pathBehind = new THREE.Vector3()

export function sampleFlightPath(
  from: THREE.Vector3,
  control: THREE.Vector3,
  to: THREE.Vector3,
  u: number,
  out: THREE.Vector3,
  tangent: THREE.Vector3,
) {
  quadBezier(from, control, to, u, out)
  const u2 = THREE.MathUtils.clamp(u + 0.03, 0, 1)
  const u0 = THREE.MathUtils.clamp(u - 0.03, 0, 1)
  quadBezier(from, control, to, u2, _pathAhead)
  quadBezier(from, control, to, u0, _pathBehind)
  tangent.subVectors(_pathAhead, _pathBehind)
  if (tangent.lengthSq() < 1e-8) tangent.set(0, 0, -1)
  else tangent.normalize()
}

export function flightBankFromTangent(tangent: THREE.Vector3, progress: number) {
  const yaw = Math.atan2(tangent.x, tangent.z)
  const pitch = Math.atan2(tangent.y, Math.hypot(tangent.x, tangent.z))
  const bank = THREE.MathUtils.clamp(pitch * 0.45 + Math.sin(progress * Math.PI) * 0.06, -0.18, 0.18)
  return { yaw, pitch: pitch * 0.3, bank }
}

/** Shortest-path angle blend — avoids 360° spins when aligning to a perch. */
export function lerpAngle(from: number, to: number, t: number) {
  const clamped = THREE.MathUtils.clamp(t, 0, 1)
  let delta = to - from
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return from + delta * clamped
}

export function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * THREE.MathUtils.clamp(t, 0, 1)) - 1) / 2
}

/** Frame-based rotation with shortest yaw path — organic turns vs snapping to path tangent. */
export function smoothRotationYXZ(
  euler: THREE.Euler,
  targetPitch: number,
  targetYaw: number,
  targetBank: number,
  delta: number,
  speed: number,
) {
  const k = 1 - Math.exp(-delta * speed)
  euler.x += (targetPitch - euler.x) * k
  euler.y = lerpAngle(euler.y, targetYaw, k)
  euler.z += (targetBank - euler.z) * k
}

export function lerpHeadGaze(
  rig: BirdRig,
  targetNeckX: number,
  targetNeckY: number,
  targetHeadX: number,
  delta: number,
  speed: number,
) {
  const k = 1 - Math.exp(-delta * speed)
  rig.neck.rotation.x += (targetNeckX - rig.neck.rotation.x) * k
  rig.neck.rotation.y += (targetNeckY - rig.neck.rotation.y) * k
  rig.head.rotation.x += (targetHeadX - rig.head.rotation.x) * k
}

export function resetCraneLimbs(rig: BirdRig) {
  rig.neck.rotation.set(0, 0, 0)
  rig.head.rotation.set(0.55, 0, 0)
  rig.tail.rotation.set(0, 0, 0)
  rig.body.rotation.set(0, 0, 0)
  applyFoldedWings(rig, 1)
}

export function perchRestPose(rig: BirdRig) {
  applyFoldedWings(rig, 1)
  rig.body.rotation.x = 0
  rig.neck.rotation.x = -0.06
  rig.head.rotation.x = 0.55
  rig.tail.rotation.x = 0.04
}

/** Lower, forward-leaning pose when standing on the ground plane */
export function groundRestPose(rig: BirdRig) {
  applyFoldedWings(rig, 1)
  rig.body.rotation.x = 0.1
  rig.neck.rotation.x = 0.06
  rig.head.rotation.x = 0.4
  rig.tail.rotation.x = 0.14
}

export function restingTailSway(rig: BirdRig, amount: number) {
  rig.tail.rotation.x = 0.04 + amount * 0.4
  rig.tail.rotation.y = amount * 0.25
}

export function preenHeadPose(rig: BirdRig, t: number) {
  const u = easeInOutCubic(t)
  rig.neck.rotation.x = THREE.MathUtils.lerp(-0.06, 0.22, u)
  rig.neck.rotation.y = THREE.MathUtils.lerp(0, 0.12, u)
  rig.head.rotation.x = THREE.MathUtils.lerp(0.55, 0.85, u)
}

export function flapRateForTuning(tuning: OrigamiAviaryTuning) {
  return 0.36 / Math.max(0.5, tuning.wingFlutterIntensity)
}

/** Depth cue: nearer birds draw on top and slightly larger */
export function applyBirdDepthCue(
  rig: BirdRig,
  worldZ: number,
  sceneDepth: number,
  depthSmooth: number,
  delta: number,
  surfaceVis = 1,
) {
  const norm = THREE.MathUtils.clamp((-worldZ - 1.5) / sceneDepth, 0, 1)
  const targetLayer = norm
  const next = depthSmooth + (targetLayer - depthSmooth) * Math.min(1, delta * 2.8)
  const near = 1 - next
  const scaleMul = THREE.MathUtils.lerp(0.86, 1.14, near)
  rig.root.renderOrder = Math.round(4 + near * 10)
  rig.root.scale.setScalar(rig.root.userData.baseScale as number * scaleMul)

  const fillMul = THREE.MathUtils.lerp(0.72, 1, near) * surfaceVis
  const edgeMul = THREE.MathUtils.lerp(0.75, 1.08, near) * surfaceVis
  rig.root.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshBasicMaterial) {
      if (o.userData.baseFill === undefined) o.userData.baseFill = o.material.opacity
      const base = o.userData.baseFill as number
      o.material.opacity = surfaceVis <= 0 ? 0 : base * fillMul
    }
    if (o instanceof THREE.LineSegments && o.material instanceof THREE.LineBasicMaterial) {
      if (o.material.userData.baseOpacity === undefined && o.material.opacity > 0.001) {
        o.material.userData.baseOpacity = o.material.opacity
      }
      const base = o.material.userData.baseOpacity as number
      o.material.opacity = surfaceVis <= 0 ? 0 : base * edgeMul
    }
  })

  return next
}
