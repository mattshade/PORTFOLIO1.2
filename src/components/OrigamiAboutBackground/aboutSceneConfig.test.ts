import { describe, expect, it } from 'vitest'
import {
  ABOUT_COLORS,
  aboutTransitionT,
  getAboutSceneProfile,
  lerpAboutColor,
} from './aboutSceneConfig'

describe('aboutSceneConfig', () => {
  it('getAboutSceneProfile picks mobile for narrow widths', () => {
    expect(getAboutSceneProfile(480).scrollRotateIntensity).toBeLessThan(
      getAboutSceneProfile(1440).scrollRotateIntensity,
    )
  })

  it('aboutTransitionT eases between configured band', () => {
    const cfg = getAboutSceneProfile(1280).transition
    expect(aboutTransitionT(cfg.start - 0.01, cfg)).toBe(0)
    expect(aboutTransitionT(cfg.end + 0.01, cfg)).toBe(1)
    expect(aboutTransitionT((cfg.start + cfg.end) / 2, cfg)).toBeGreaterThan(0.4)
  })

  it('lerpAboutColor blends hex colors', () => {
    const mid = lerpAboutColor(ABOUT_COLORS.cavernFog, ABOUT_COLORS.cavernBackground, 0.5)
    expect(mid).toBeGreaterThan(0)
    expect(mid).not.toBe(ABOUT_COLORS.cavernFog)
  })
})
