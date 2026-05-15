import * as THREE from 'three'
import type { OrigamiAviaryTuning } from './constants'
import { scrollParallaxDrive } from './sceneAnchor'

export type InteractionState = {
  pointer: THREE.Vector2
  pointerSmooth: THREE.Vector2
  pointerVel: THREE.Vector2
  scrollNorm: number
  scrollSmooth: number
  scrollVel: number
}

export function createInteractionState(): InteractionState {
  return {
    pointer: new THREE.Vector2(0, 0),
    pointerSmooth: new THREE.Vector2(0, 0),
    pointerVel: new THREE.Vector2(0, 0),
    scrollNorm: 0,
    scrollSmooth: 0,
    scrollVel: 0,
  }
}

export function updateInteractionState(
  state: InteractionState,
  pointer: THREE.Vector2,
  scrollNorm: number,
  delta: number,
  tuning: OrigamiAviaryTuning,
  reducedMotion: boolean,
) {
  state.scrollVel = (scrollNorm - state.scrollNorm) / Math.max(delta, 0.001)
  state.scrollNorm = scrollNorm

  const pk = reducedMotion ? 14 : tuning.pointerSmoothing
  const sk = reducedMotion ? 11 : tuning.scrollSmoothing
  const pa = 1 - Math.exp(-delta * pk)
  const sa = 1 - Math.exp(-delta * sk)

  state.pointerVel.set(
    (pointer.x - state.pointerSmooth.x) / Math.max(delta, 0.001),
    (pointer.y - state.pointerSmooth.y) / Math.max(delta, 0.001),
  )
  state.pointerSmooth.x += (pointer.x - state.pointerSmooth.x) * pa
  state.pointerSmooth.y += (pointer.y - state.pointerSmooth.y) * pa
  state.scrollSmooth += (scrollNorm - state.scrollSmooth) * sa
}

/** Map NDC pointer to world X/Y on a plane at the given Z (for bird gaze) */
export function pointerOnPlaneZ(
  pointerNdc: THREE.Vector2,
  camera: THREE.PerspectiveCamera,
  planeZ: number,
  target: THREE.Vector3,
) {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(pointerNdc, camera)
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ)
  const hit = ray.ray.intersectPlane(plane, target)
  if (!hit) target.set(0, 1.4, planeZ)
  return target
}

export function applyCameraInteraction(
  camera: THREE.PerspectiveCamera,
  baseCam: THREE.Vector3,
  baseLook: THREE.Vector3,
  state: InteractionState,
  tuning: OrigamiAviaryTuning,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    camera.position.copy(baseCam)
    camera.lookAt(baseLook)
    camera.rotation.z = 0
    camera.fov = 43
    camera.updateProjectionMatrix()
    return
  }

  const s = 0.011 * tuning.parallaxIntensity
  const scrollDrive = scrollParallaxDrive(state.scrollSmooth)
  const scrollOff = scrollDrive * tuning.scrollDriftIntensity * 0.5
  const scrollT = scrollDrive

  camera.position.set(
    baseCam.x + state.pointerSmooth.x * s,
    baseCam.y - state.pointerSmooth.y * s * 0.28 + scrollOff * 0.055 - scrollT * 0.22,
    baseCam.z + scrollOff * 0.14 - scrollT * 0.55,
  )
  camera.lookAt(
    baseLook.x + state.pointerSmooth.x * s * 0.28,
    baseLook.y - state.pointerSmooth.y * s * 0.16 + scrollOff * 0.04 - scrollT * 0.12,
    baseLook.z,
  )
  camera.rotation.z = scrollT * tuning.scrollRotateIntensity * 0.06
  camera.fov = 43 - scrollT * 5.5
  camera.updateProjectionMatrix()
}

export function applyEnvironmentInteraction(
  layers: THREE.Group[],
  state: InteractionState,
  tuning: OrigamiAviaryTuning,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    layers.forEach((l) => {
      l.position.set(0, 0, 0)
      l.rotation.set(0, 0, 0)
    })
    return
  }

  const s = tuning.parallaxIntensity * 0.055
  const scrollOff = scrollParallaxDrive(state.scrollSmooth) * tuning.scrollDriftIntensity * 0.5
  layers.forEach((layer, i) => {
    const depth = 0.28 + i * 0.28
    layer.position.x = state.pointerSmooth.x * s * depth
    layer.position.y = state.pointerSmooth.y * s * depth * 0.35 + scrollOff * 0.032 * (i + 1)
    layer.position.z = scrollOff * 0.022 * (i + 1)
    layer.rotation.y = state.pointerSmooth.x * 0.003 * (i + 1)
    layer.rotation.x = state.pointerSmooth.y * 0.002 * (i + 1)
  })
}
