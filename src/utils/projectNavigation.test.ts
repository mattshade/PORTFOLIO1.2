import { describe, expect, it, vi } from 'vitest'
import type { Location } from 'react-router-dom'
import { buildProjectRouteState, restoreScrollPosition } from './projectNavigation'

describe('projectNavigation', () => {
  it('buildProjectRouteState captures scroll position', () => {
    Object.defineProperty(window, 'scrollY', { value: 240, configurable: true })
    const background = { pathname: '/', search: '', hash: '', state: null, key: 'abc' } as Location
    expect(buildProjectRouteState(background)).toEqual({ background, scrollY: 240 })
  })

  it('restoreScrollPosition calls window.scrollTo', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    restoreScrollPosition(512)
    expect(scrollTo).toHaveBeenCalledWith(0, 512)
    vi.unstubAllGlobals()
  })
})
