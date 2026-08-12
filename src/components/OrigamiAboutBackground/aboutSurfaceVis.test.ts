import { describe, expect, it } from 'vitest'
import { computeAboutSurfaceVis } from './aboutSurfaceVis'

describe('aboutSurfaceVis', () => {
  it('computeAboutSurfaceVis stays full until entry begins', () => {
    expect(computeAboutSurfaceVis(0)).toBe(1)
    expect(computeAboutSurfaceVis(-0.2)).toBe(1)
  })

  it('computeAboutSurfaceVis retains canopy silhouette at full entry', () => {
    expect(computeAboutSurfaceVis(1)).toBeCloseTo(0.24)
  })

  it('computeAboutSurfaceVis fades smoothly mid-entry', () => {
    const mid = computeAboutSurfaceVis(0.65)
    expect(mid).toBeGreaterThan(0.24)
    expect(mid).toBeLessThan(1)
  })
})
