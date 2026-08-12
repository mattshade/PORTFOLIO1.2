import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getNavRotationSpinFraming,
  getNavRotationState,
  isNavRotationActive,
  navRotationFramingWeight,
  prepareNavSpinFraming,
  requestNavRotation,
  requestNavRotationInstant,
  subscribeNavRotation,
  tickNavRotation,
} from './navRotationBridge'

describe('navRotationBridge', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    requestNavRotationInstant()
    while (isNavRotationActive()) {
      tickNavRotation(5000, false)
    }
  })

  it('starts idle and activates on request', () => {
    expect(getNavRotationState().phase).toBe('idle')
    expect(requestNavRotation()).toBe(true)
    expect(isNavRotationActive()).toBe(true)
  })

  it('ticks spin to completion', () => {
    requestNavRotation()
    const startY = getNavRotationState().rotationY
    let spinning = true
    while (spinning) {
      spinning = tickNavRotation(200, false)
    }
    expect(isNavRotationActive()).toBe(false)
    expect(getNavRotationState().rotationY).not.toBe(startY)
  })

  it('completes instantly under reduced motion', () => {
    requestNavRotation()
    tickNavRotation(16, true)
    expect(isNavRotationActive()).toBe(false)
    expect(getNavRotationSpinFraming()).toEqual({ fovBoost: 0, zPull: 0 })
  })

  it('prepares framing weights during spin', () => {
    requestNavRotation()
    prepareNavSpinFraming(42, 30)
    expect(getNavRotationSpinFraming().fovBoost).toBeGreaterThan(0)
    tickNavRotation(400, false)
    expect(navRotationFramingWeight()).toBeGreaterThan(0)
  })

  it('notifies subscribers', () => {
    const listener = vi.fn()
    const unsub = subscribeNavRotation(listener)
    expect(listener).toHaveBeenCalled()
    requestNavRotation()
    expect(listener.mock.calls.at(-1)?.[0].phase).toBe('spinning')
    unsub()
  })
})
