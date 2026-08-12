import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { DEFAULT_AVIARY_TUNING } from './constants'
import {
  applyBottomAnchor,
  applyScrollParallaxRotation,
  applyWideForestCamera,
  scrollForestYaw,
  scrollParallaxDrive,
  scrollParallaxWeight,
} from './sceneAnchor'

describe('sceneAnchor', () => {
  it('ramps parallax weight from page top', () => {
    expect(scrollParallaxWeight(0)).toBe(0)
    expect(scrollParallaxWeight(0.5)).toBeGreaterThan(0.9)
    expect(scrollParallaxWeight(1)).toBe(1)
  })

  it('scrollParallaxDrive is neutral at top and signed below/above mid-scroll', () => {
    expect(scrollParallaxDrive(0)).toBeCloseTo(0)
    expect(scrollParallaxDrive(0.25)).toBeLessThan(0)
    expect(scrollParallaxDrive(0.75)).toBeGreaterThan(0)
    expect(scrollParallaxDrive(1)).toBeGreaterThan(0)
  })

  it('scrollForestYaw scales with revolutions', () => {
    expect(scrollForestYaw(0, 0.3)).toBe(0)
    expect(scrollForestYaw(1, 0.3)).toBeCloseTo(Math.PI * 2 * 0.3)
    expect(scrollForestYaw(1.5, 0.3)).toBeCloseTo(Math.PI * 2 * 0.3)
  })

  it('applyBottomAnchor shifts world on tall aspect', () => {
    const camera = new THREE.PerspectiveCamera()
    const world = new THREE.Group()
    applyBottomAnchor(camera, world, 0.7, 0.5, 1)
    expect(world.position.y).toBeLessThan(-0.9)
  })

  it('applyScrollParallaxRotation tilts stage from scroll drive', () => {
    const stage = new THREE.Group()
    applyScrollParallaxRotation(stage, 1, 0.5)
    expect(stage.rotation.x).not.toBe(0)
    expect(stage.position.z).toBeGreaterThan(0)
  })

  it('applyWideForestCamera trims portrait FOV and widens ultrawide', () => {
    const camera = new THREE.PerspectiveCamera(50, 0.7, 0.1, 100)
    camera.position.z = 5
    applyWideForestCamera(camera, 0.7, {
      ...DEFAULT_AVIARY_TUNING,
      viewportProfile: 'narrow',
      portraitFovTrim: 6,
    })
    expect(camera.fov).toBeLessThan(50)

    camera.fov = 50
    camera.position.z = 5
    applyWideForestCamera(camera, 2, {
      ...DEFAULT_AVIARY_TUNING,
      viewportProfile: 'desktop',
      portraitFovTrim: 0,
    })
    expect(camera.position.z).toBeGreaterThan(5)
    expect(camera.fov).toBeGreaterThan(50)
  })
})
