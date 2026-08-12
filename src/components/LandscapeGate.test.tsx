import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shouldShowLandscapeGate } from '../utils/landscapeViewport'

vi.mock('../utils/landscapeViewport', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/landscapeViewport')>()
  return {
    ...actual,
    shouldShowLandscapeGate: vi.fn(() => false),
    markTouchMobileDocument: vi.fn(),
    subscribeLandscapeGate: vi.fn((callback: () => void) => {
      callback()
      return () => {}
    }),
  }
})

import { LandscapeGate } from './LandscapeGate'

describe('LandscapeGate', () => {
  afterEach(() => {
    document.documentElement.classList.remove('landscape-gate-active')
    vi.clearAllMocks()
  })

  it('renders overlay markup for CSS fallback', () => {
    render(<LandscapeGate />)
    expect(screen.getByLabelText('Rotate your device')).toBeInTheDocument()
  })

  it('activates when shouldShowLandscapeGate is true', () => {
    vi.mocked(shouldShowLandscapeGate).mockReturnValue(true)
    render(<LandscapeGate />)
    expect(screen.getByRole('dialog', { name: 'Rotate your device' })).toHaveClass('landscape-gate--active')
    expect(document.documentElement.classList.contains('landscape-gate-active')).toBe(true)
  })
})
