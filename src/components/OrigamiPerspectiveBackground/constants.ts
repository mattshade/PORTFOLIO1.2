/**
 * Tuning for the architectural drafting-space background.
 * Aligned with site tokens: near-black `--bg`, muted `--grid-color` / `--brand` accents.
 */
export type OrigamiPerspectiveTuning = {
  seed: number
  /** Smaller birds that drift / occasional slow glides */
  smallBirdCount: number
  /** Sculptural forms near viewport sides (mostly static micro-motion) */
  largeBirdCount: number
  /** Perspective grid + faint back-plane wire opacity */
  gridOpacity: number
  /** Reference frames, back-wall guides, coordinate ticks */
  lineOpacity: number
  /** Multiplier on drift / glide speeds and edge “light” pulse (keep ≤ ~1.1 for subtlety) */
  animationIntensity: number
  /** Multiplier on camera parallax from pointer */
  parallaxIntensity: number
  /** Edge highlights and secondary construction lines (hex) */
  accentColor: number
  /** Exp2 fog density — higher pushes distant lines into haze sooner */
  fogDensity: number
  /** Characteristic depth (|z|) used to scale placements; pairs with fog */
  sceneDepth: number
  maxPixelRatio: number
  pointerSmoothing: number
  groundGridDivisions: number
  constructionFrameCount: number
}

export const DEFAULT_ORIGAMI_PERSPECTIVE_TUNING: OrigamiPerspectiveTuning = {
  seed: 0x4f726967,
  smallBirdCount: 5,
  largeBirdCount: 2,
  gridOpacity: 0.12,
  lineOpacity: 0.14,
  animationIntensity: 1,
  parallaxIntensity: 1,
  accentColor: 0x8ab97a,
  /** Light — Exp2 was washing birds / frames into the clear color */
  fogDensity: 0.011,
  sceneDepth: 12,
  maxPixelRatio: 1.35,
  pointerSmoothing: 5.5,
  groundGridDivisions: 26,
  constructionFrameCount: 4,
}

/** Base palette — restrained green-gray blueprint language */
export const ORIGAMI_PERSPECTIVE_BASE_COLORS = {
  background: 0x0a0c0b,
  fog: 0x0a0c0b,
  /** Construction lines — must read over GL clear (screenshot showed grid-only) */
  lineMuted: 0x5f7a58,
  /** Facets slightly lighter than clear color so folded planes read */
  birdFill: 0x162219,
} as const

export function getResponsivePerspectiveTuning(): OrigamiPerspectiveTuning {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_ORIGAMI_PERSPECTIVE_TUNING }
  }

  const w = window.innerWidth
  const dpr = window.devicePixelRatio ?? 1
  const reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches

  const t: OrigamiPerspectiveTuning = { ...DEFAULT_ORIGAMI_PERSPECTIVE_TUNING }

  if (w < 480 || reducedData) {
    t.smallBirdCount = 3
    t.largeBirdCount = 1
    t.groundGridDivisions = 16
    t.gridOpacity = 0.09
    t.lineOpacity = 0.1
    t.constructionFrameCount = 2
    t.fogDensity = Math.min(t.fogDensity, 0.016)
    t.maxPixelRatio = 1
    t.parallaxIntensity = 0.65
    t.animationIntensity = Math.min(t.animationIntensity, 0.85)
  } else if (w < 768 || coarse) {
    t.smallBirdCount = 4
    t.largeBirdCount = 2
    t.groundGridDivisions = 20
    t.maxPixelRatio = Math.min(1, dpr)
    t.parallaxIntensity = 0.82
  } else if (w < 1100) {
    t.smallBirdCount = 4
    t.maxPixelRatio = Math.min(1.25, dpr)
  } else {
    t.maxPixelRatio = Math.min(t.maxPixelRatio, dpr)
  }

  return t
}
