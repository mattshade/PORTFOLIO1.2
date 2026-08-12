import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_AVIARY_TUNING } from './constants'
import {
  getAboutDnaWebGLRendererOptions,
  getLightWebGLRendererOptions,
  getWebGLRendererOptions,
  isFragileWebGLDevice,
  setAboutVineSceneActive,
  shouldBuildAviaryCavern,
  shouldPauseAviaryWhileAboutVine,
  shouldUseAboutCavernInversion,
  shouldUseAboutDnaWebGL,
  shouldUseAviaryPostProcessing,
  shouldUseEmbeddedAboutVine,
} from './webglCapabilities'

describe('webglCapabilities', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    vi.stubGlobal('navigator', { userAgent: 'Macintosh' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('treats desktop as non-fragile', () => {
    expect(isFragileWebGLDevice()).toBe(false)
    expect(shouldUseAboutDnaWebGL()).toBe(true)
    expect(shouldUseEmbeddedAboutVine()).toBe(true)
    expect(shouldBuildAviaryCavern()).toBe(true)
    expect(shouldUseAboutCavernInversion()).toBe(true)
  })

  it('treats narrow Android as fragile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 412, configurable: true })
    vi.stubGlobal('navigator', { userAgent: 'Android' })
    expect(isFragileWebGLDevice()).toBe(true)
    expect(shouldBuildAviaryCavern()).toBe(false)
  })

  it('renderer options prefer performance on desktop', () => {
    const opts = getWebGLRendererOptions({
      ...DEFAULT_AVIARY_TUNING,
      viewportProfile: 'desktop',
    })
    expect(opts.powerPreference).toBe('high-performance')
    expect(getLightWebGLRendererOptions().antialias).toBe(true)
  })

  it('disables post-processing on fragile devices', () => {
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true })
    expect(
      shouldUseAviaryPostProcessing({
        ...DEFAULT_AVIARY_TUNING,
        viewportProfile: 'narrow',
        bloomStrength: 0.2,
      }),
    ).toBe(false)
  })

  it('enables post-processing on capable desktop tuning', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
    expect(
      shouldUseAviaryPostProcessing({
        ...DEFAULT_AVIARY_TUNING,
        viewportProfile: 'desktop',
        bloomStrength: 0.2,
      }),
    ).toBe(true)
  })

  it('returns DNA renderer options and vine scene flags', () => {
    expect(getAboutDnaWebGLRendererOptions().alpha).toBe(true)
    setAboutVineSceneActive(true)
    expect(shouldPauseAviaryWhileAboutVine()).toBe(false)
  })
})
