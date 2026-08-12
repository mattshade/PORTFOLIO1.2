import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isAppleTouchDevice,
  isAndroidTouchDevice,
  isPortraitViewport,
  isTouchMobileViewport,
  markTouchMobileDocument,
  shouldShowLandscapeGate,
} from './landscapeViewport'

function mockMatchMedia(map: Record<string, boolean>) {
  vi.stubGlobal('matchMedia', (query: string) => {
    let matches = true
    if (query.includes('max-width: 1024px')) matches &&= map['max-width: 1024px'] ?? true
    if (query.includes('orientation: portrait')) matches &&= map.portrait ?? true
    if (query.includes('orientation: landscape')) matches &&= map.landscape ?? false
    if (query.includes('pointer: coarse')) matches &&= map.coarse ?? false
    if (query.includes('hover: none')) matches &&= map['hover: none'] ?? false
    return {
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList
  })
}

describe('landscapeViewport', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 412, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 915, configurable: true })
    document.documentElement.classList.remove('touch-mobile')
  })

  afterEach(() => {
    document.documentElement.classList.remove('touch-mobile')
    vi.unstubAllGlobals()
  })

  it('detects Android portrait without pointer: coarse', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 14)', maxTouchPoints: 5 })
    mockMatchMedia({ portrait: true })

    expect(isAndroidTouchDevice()).toBe(true)
    expect(isTouchMobileViewport()).toBe(true)
    expect(isPortraitViewport()).toBe(true)
    expect(shouldShowLandscapeGate()).toBe(true)
  })

  it('detects iPhone portrait', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', maxTouchPoints: 5 })
    mockMatchMedia({ portrait: true })

    expect(isAppleTouchDevice()).toBe(true)
    expect(shouldShowLandscapeGate()).toBe(true)
  })

  it('detects iPadOS devices that report a Mac UA', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      maxTouchPoints: 5,
    })
    Object.defineProperty(window, 'innerWidth', { value: 834, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1194, configurable: true })
    mockMatchMedia({ portrait: true })

    expect(isAppleTouchDevice()).toBe(true)
    expect(shouldShowLandscapeGate()).toBe(true)
  })

  it('does not gate desktop landscape', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1366, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })
    vi.stubGlobal('navigator', { userAgent: 'Macintosh', maxTouchPoints: 0 })
    mockMatchMedia({ portrait: false, landscape: true })

    expect(shouldShowLandscapeGate()).toBe(false)
  })

  it('does not gate touch mobile in landscape', () => {
    Object.defineProperty(window, 'innerWidth', { value: 915, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 412, configurable: true })
    vi.stubGlobal('navigator', { userAgent: 'Android', maxTouchPoints: 5 })
    mockMatchMedia({ portrait: false, landscape: true })

    expect(shouldShowLandscapeGate()).toBe(false)
  })

  it('marks touch-mobile on the document element', () => {
    vi.stubGlobal('navigator', { userAgent: 'Android', maxTouchPoints: 5 })
    markTouchMobileDocument()
    expect(document.documentElement.classList.contains('touch-mobile')).toBe(true)
  })
})
