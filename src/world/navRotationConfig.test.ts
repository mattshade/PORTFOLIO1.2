import { describe, expect, it, vi } from 'vitest'
import {
  NAV_ROTATION_CONFIG,
  estimateSpinFraming,
  navSpinEase,
  navSpinFramingWeight,
  normalizeRadians,
  randomNavSpinDelta,
} from './navRotationConfig'

describe('navRotationConfig', () => {
  it('normalizeRadians wraps to [0, 2π)', () => {
    const tau = Math.PI * 2
    expect(normalizeRadians(0)).toBe(0)
    expect(normalizeRadians(tau)).toBeCloseTo(0)
    expect(normalizeRadians(-Math.PI)).toBeCloseTo(Math.PI)
  })

  it('navSpinEase is 0/1 at endpoints and monotonic mid-range', () => {
    expect(navSpinEase(0)).toBe(0)
    expect(navSpinEase(1)).toBe(1)
    expect(navSpinEase(0.5)).toBeGreaterThan(0.4)
    expect(navSpinEase(0.5)).toBeLessThan(0.6)
  })

  it('navSpinFramingWeight peaks mid-spin and fades at ends', () => {
    expect(navSpinFramingWeight(0)).toBe(0)
    expect(navSpinFramingWeight(1)).toBe(0)
    const mid = navSpinFramingWeight(0.45)
    const tail = navSpinFramingWeight(0.9)
    expect(mid).toBeGreaterThan(tail)
    expect(mid).toBeGreaterThan(0)
  })

  it('randomNavSpinDelta stays within configured degree range', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0)
    const minDelta = randomNavSpinDelta()
    expect(Math.abs(minDelta)).toBeCloseTo(NAV_ROTATION_CONFIG.minDegrees * (Math.PI / 180))

    vi.spyOn(Math, 'random').mockReturnValueOnce(1).mockReturnValueOnce(1)
    const maxDelta = randomNavSpinDelta()
    expect(Math.abs(maxDelta)).toBeCloseTo(NAV_ROTATION_CONFIG.maxDegrees * (Math.PI / 180))
  })

  it('estimateSpinFraming scales with arc and scene size', () => {
    const small = estimateSpinFraming(Math.PI / 4, 20, 20)
    const large = estimateSpinFraming(Math.PI, 60, 40)
    expect(large.fovBoost).toBeGreaterThan(small.fovBoost)
    expect(large.zPull).toBeGreaterThan(small.zPull)
    expect(large.fovBoost).toBeLessThanOrEqual(NAV_ROTATION_CONFIG.fovBoostMax)
    expect(large.zPull).toBeLessThanOrEqual(NAV_ROTATION_CONFIG.cameraPullbackMax)
  })
})
