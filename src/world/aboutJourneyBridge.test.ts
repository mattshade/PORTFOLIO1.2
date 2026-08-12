import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  computeAboutDescentScrollY,
  getAboutNavChoreoEntry,
  isAboutNavDescentActive,
  requestAboutNavDescent,
  requestAboutNavDescentInstant,
  tickAboutNavDescent,
} from './aboutJourneyBridge'

describe('aboutJourneyBridge', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn())
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, configurable: true, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns zero choreo entry when idle', () => {
    expect(getAboutNavChoreoEntry()).toBe(0)
    expect(isAboutNavDescentActive()).toBe(false)
  })

  it('computes descent scroll from marker elements', () => {
    const start = document.createElement('div')
    start.id = 'about-descent-start'
    const end = document.createElement('div')
    end.id = 'about-descent-end'
    const about = document.createElement('section')
    about.id = 'about'
    document.body.append(start, end, about)

    start.getBoundingClientRect = () => ({ top: 400, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })
    end.getBoundingClientRect = () => ({ top: 1600, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })
    about.getBoundingClientRect = () => ({ top: 1800, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })

    expect(computeAboutDescentScrollY()).toBeGreaterThan(800)
    start.remove()
    end.remove()
    about.remove()
  })

  it('scrolls instantly when requested', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    const about = document.createElement('section')
    about.id = 'about'
    document.body.appendChild(about)
    about.getBoundingClientRect = () => ({ top: 900, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })

    requestAboutNavDescentInstant()
    expect(scrollTo).toHaveBeenCalled()
    about.remove()
    vi.unstubAllGlobals()
  })

  it('queues descent when target is far enough away', () => {
    const about = document.createElement('section')
    about.id = 'about'
    document.body.appendChild(about)
    about.getBoundingClientRect = () => ({ top: 2000, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })

    expect(requestAboutNavDescent()).toBe(true)
    expect(isAboutNavDescentActive()).toBe(true)
    tickAboutNavDescent(performance.now() + 500)
    expect(getAboutNavChoreoEntry()).toBeGreaterThan(0)
    about.remove()
  })

  it('skips descent when already near target', () => {
    const about = document.createElement('section')
    about.id = 'about'
    document.body.appendChild(about)
    about.getBoundingClientRect = () => ({
      top: 800 * 0.14,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    expect(requestAboutNavDescent()).toBe(false)
    expect(isAboutNavDescentActive()).toBe(false)
    about.remove()
  })

  it('completes programmatic scroll after waiting phase', () => {
    const about = document.createElement('section')
    about.id = 'about'
    document.body.appendChild(about)
    about.getBoundingClientRect = () => ({ top: 3000, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })

    requestAboutNavDescent()
    const start = performance.now()
    tickAboutNavDescent(start + 400)
    tickAboutNavDescent(start + 500)
    tickAboutNavDescent(start + 3200)
    expect(isAboutNavDescentActive()).toBe(false)
    about.remove()
  })
})
