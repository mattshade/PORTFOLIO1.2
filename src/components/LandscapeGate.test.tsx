import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LandscapeGate } from './LandscapeGate'

function mockMatchMedia(matches: Record<string, boolean>) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: Object.entries(matches).some(([key, value]) => query.includes(key) && value),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  )
}

describe('LandscapeGate', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })
  })

  afterEach(() => {
    document.documentElement.classList.remove('landscape-gate-active')
    vi.unstubAllGlobals()
  })

  it('blocks portrait mobile viewports', () => {
    mockMatchMedia({ 'max-width: 900px': true, coarse: true, portrait: true })
    render(<LandscapeGate />)
    expect(screen.getByRole('dialog', { name: 'Rotate your device' })).toBeInTheDocument()
    expect(document.documentElement.classList.contains('landscape-gate-active')).toBe(true)
  })

  it('renders nothing in landscape', () => {
    Object.defineProperty(window, 'innerWidth', { value: 844, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 390, configurable: true })
    mockMatchMedia({ 'max-width: 900px': true, coarse: true, portrait: false })
    render(<LandscapeGate />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cleans up landscape gate class on unmount', () => {
    mockMatchMedia({ 'max-width: 900px': true, coarse: true, portrait: true })
    const { unmount } = render(<LandscapeGate />)
    expect(document.documentElement.classList.contains('landscape-gate-active')).toBe(true)
    unmount()
    expect(document.documentElement.classList.contains('landscape-gate-active')).toBe(false)
  })
})
