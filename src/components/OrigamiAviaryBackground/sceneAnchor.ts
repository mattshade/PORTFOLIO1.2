import * as THREE from 'three'
import type { OrigamiAviaryTuning } from './constants'

/** Ramp scroll parallax in from the top so the hero loads level. */
export function scrollParallaxWeight(scrollSmooth: number): number {
  return Math.min(1, scrollSmooth * 2.75)
}

/** Signed scroll drive: 0 at page top, neutral near mid-scroll, full at bottom. */
export function scrollParallaxDrive(scrollSmooth: number): number {
  return (scrollSmooth - 0.5) * 2 * scrollParallaxWeight(scrollSmooth)
}

/** Nudge the world so foliage fills the frame rather than the ground plane. */
export function applyBottomAnchor(
  camera: THREE.PerspectiveCamera,
  world: THREE.Group,
  aspect: number,
  scrollSmooth: number,
  scrollDrift: number,
) {
  const tall = aspect < 0.85
  const wide = aspect > 1.65
  const baseLift = tall ? -0.95 : wide ? -0.68 : -0.78
  const scrollShift = scrollParallaxDrive(scrollSmooth) * scrollDrift * 0.34
  world.position.set(0, baseLift - scrollShift, 0)
}

export const BOTTOM_ANCHOR_CAMERA = new THREE.Vector3(0, 1.58, 2.75)
export const BOTTOM_ANCHOR_LOOK = new THREE.Vector3(0, 1.08, -4.5)

/** Y-axis spin (radians) for the 360° forest ring from scroll progress 0 → 1. */
export function scrollForestYaw(scrollSmooth: number, revolutions: number): number {
  const t = THREE.MathUtils.clamp(scrollSmooth, 0, 1)
  return t * Math.PI * 2 * revolutions
}

/** Rotate and shift the aviary stage on scroll for a strong perspective tilt. */
export function applyScrollParallaxRotation(
  stage: THREE.Object3D,
  scrollSmooth: number,
  rotateIntensity: number,
) {
  const t = scrollParallaxDrive(scrollSmooth)
  const i = rotateIntensity
  stage.rotation.set(t * i * 0.72, t * i * 0.28, t * i * 0.32)
  stage.position.set(0, t * i * 0.16, t * i * 0.42)
}

/**
 * After pointer/scroll offsets are applied: portrait crop on narrow, ultrawide pull-back.
 * Mutates `camera.fov` and `camera.position.z` relative to the current interaction state.
 */
export function applyWideForestCamera(
  camera: THREE.PerspectiveCamera,
  aspect: number,
  tuning: OrigamiAviaryTuning,
) {
  if (aspect < 1 && tuning.viewportProfile === 'narrow' && tuning.portraitFovTrim > 0) {
    camera.fov = Math.max(30, camera.fov - tuning.portraitFovTrim)
    camera.updateProjectionMatrix()
  }

  if (aspect > 1.85) {
    camera.position.z += (aspect - 1.85) * 0.55
    camera.fov += (aspect - 1.85) * 3.2
    camera.updateProjectionMatrix()
  }
}
