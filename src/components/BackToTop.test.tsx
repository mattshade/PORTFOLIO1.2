import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BackToTop } from './BackToTop'

describe('BackToTop', () => {
  it('shows after scrolling past threshold', () => {
    Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true })
    render(<BackToTop />)
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument()

    Object.defineProperty(window, 'pageYOffset', { value: 500, configurable: true })
    fireEvent.scroll(window)
    expect(screen.getByRole('button', { name: 'Back to top' })).toHaveClass('visible')
  })

  it('scrolls to top on click', () => {
    vi.useFakeTimers()
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    Object.defineProperty(window, 'pageYOffset', { value: 500, configurable: true })

    render(<BackToTop />)
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }))
    vi.advanceTimersByTime(300)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})
