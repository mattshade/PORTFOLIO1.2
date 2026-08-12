import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_AVIARY_TUNING,
  catVisibleMaxYForProfile,
  getAviaryViewportProfile,
  getResponsiveAviaryTuning,
} from './constants'

describe('aviary constants', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('coarse') || query.includes('reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getAviaryViewportProfile buckets widths', () => {
    expect(getAviaryViewportProfile(480)).toBe('narrow')
    expect(getAviaryViewportProfile(900)).toBe('tablet')
    expect(getAviaryViewportProfile(1280)).toBe('desktop')
  })

  it('catVisibleMaxYForProfile returns profile-specific caps', () => {
    expect(catVisibleMaxYForProfile('narrow')).toBeLessThan(catVisibleMaxYForProfile('desktop'))
  })

  it('getResponsiveAviaryTuning adapts to narrow phones', () => {
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true })
    vi.stubGlobal('navigator', { userAgent: 'iPhone' })

    const phone = getResponsiveAviaryTuning()
    expect(phone.viewportProfile).toBe('narrow')
    expect(phone.posterComposition).toBe(true)
    expect(phone.birdCount).toBe(5)

    Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true })
    const narrowTablet = getResponsiveAviaryTuning()
    expect(narrowTablet.birdCount).toBe(7)
    expect(narrowTablet.birdCount).toBeLessThan(DEFAULT_AVIARY_TUNING.birdCount)
  })

  it('getResponsiveAviaryTuning adapts tablet and desktop profiles', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 700, configurable: true })
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
    vi.stubGlobal('navigator', { userAgent: 'Macintosh' })

    const tablet = getResponsiveAviaryTuning()
    expect(tablet.viewportProfile).toBe('tablet')
    expect(tablet.birdCount).toBe(14)

    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    const desktop = getResponsiveAviaryTuning()
    expect(desktop.viewportProfile).toBe('desktop')
    expect(desktop.treeCount).toBeGreaterThanOrEqual(tablet.treeCount)
  })

  it('getResponsiveAviaryTuning honors reduced motion and reduced data', () => {
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const tuning = getResponsiveAviaryTuning()
    expect(tuning.scrollRotateIntensity).toBe(0)
    expect(tuning.particleCount).toBeLessThanOrEqual(80)
  })

  it('getResponsiveAviaryTuning adjusts coarse-pointer tablet controls', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 700, configurable: true })
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('coarse'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const tuning = getResponsiveAviaryTuning()
    expect(tuning.pointerParallaxScale).toBe(0.55)
    expect(tuning.layerPointerRotationScale).toBe(0.45)
  })

  it('getResponsiveAviaryTuning increases trees on ultrawide desktop', () => {
    Object.defineProperty(window, 'innerWidth', { value: 2200, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const tuning = getResponsiveAviaryTuning()
    expect(tuning.treeCount).toBe(92)
  })
})
