import type * as THREE from 'three'
import { NAV_ROTATION_CONFIG } from '../../world/navRotationConfig'
import {
  getNavRotationSpinFraming,
  getNavRotationState,
  isNavRotationActive,
  navRotationFramingWeight,
  prepareNavSpinFraming,
  tickNavRotation,
} from '../../world/navRotationBridge'

export type NavRotationMotionTargets = {
  spinPivot: THREE.Group
  camera: THREE.PerspectiveCamera
  frameBaseZ: number
  frameBaseFov: number
  forestHalfWidth: number
  sceneDepth: number
}

let framingPrepared = false
let smoothFovBoost = 0
let smoothZPull = 0
let releaseFovBoost = 0
let releaseZPull = 0

export function applyNavRotationMotion(
  targets: NavRotationMotionTargets,
  deltaMs: number,
  reducedMotion: boolean,
): boolean {
  const wasSpinning = isNavRotationActive()
  tickNavRotation(deltaMs, reducedMotion)
  const spinning = isNavRotationActive()

  if (spinning && !framingPrepared) {
    prepareNavSpinFraming(targets.forestHalfWidth, targets.sceneDepth)
    framingPrepared = true
  }
  if (!spinning && !wasSpinning) framingPrepared = false

  const { rotationY } = getNavRotationState()
  targets.spinPivot.rotation.y = rotationY
  targets.spinPivot.rotation.x = 0
  targets.spinPivot.rotation.z = 0

  const dt = Math.max(0.001, deltaMs / 1000)

  if (spinning) {
    const weight = navRotationFramingWeight()
    const { fovBoost, zPull } = getNavRotationSpinFraming()
    releaseFovBoost = fovBoost * weight
    releaseZPull = zPull * weight

    const k = 1 - Math.exp(-dt * NAV_ROTATION_CONFIG.cameraSmoothing)
    smoothFovBoost += (releaseFovBoost - smoothFovBoost) * k
    smoothZPull += (releaseZPull - smoothZPull) * k
  } else if (wasSpinning || smoothFovBoost > 0.001 || smoothZPull > 0.001) {
    // Glide camera offsets back to baseline — don't drop targets instantly when the spin stops.
    const k = 1 - Math.exp(-dt * NAV_ROTATION_CONFIG.cameraReleaseSmoothing)
    smoothFovBoost += (0 - smoothFovBoost) * k
    smoothZPull += (0 - smoothZPull) * k
    releaseFovBoost = 0
    releaseZPull = 0
  }

  const applyingCamera = smoothFovBoost > 0.0005 || smoothZPull > 0.0005
  if (applyingCamera) {
    targets.camera.fov = targets.frameBaseFov + smoothFovBoost
    targets.camera.position.z = targets.frameBaseZ + smoothZPull
    targets.camera.updateProjectionMatrix()
  } else {
    smoothFovBoost = 0
    smoothZPull = 0
  }

  return spinning || applyingCamera
}

export function isNavRotationBusy(): boolean {
  return isNavRotationActive() || smoothFovBoost > 0.0005 || smoothZPull > 0.0005
}
