/**
 * Tunable aviary atmosphere — aligned with site `--bg` / muted green blueprint language.
 */
export type OrigamiAviaryTuning = {
  seed: number
  birdCount: number
  sculpturalBirdCount: number
  treeCount: number
  branchDepth: number
  latticePanelCount: number
  suspendedLineCount: number
  vineConnectionCount: number
  particleCount: number
  particleIntensity: number
  lightColumnCount: number
  ceilingArcCount: number
  portalFrameCount: number
  floorGuideCount: number
  atmosphereDrift: number
  glowPassStrength: number
  bloomStrength: number
  bloomRadius: number
  bloomThreshold: number
  lineWidth: number
  gridOpacity: number
  lineOpacity: number
  animationIntensity: number
  parallaxIntensity: number
  scrollDriftIntensity: number
  /** Max scroll parallax rotation (radians scale at page top/bottom) */
  scrollRotateIntensity: number
  scrollSmoothing: number
  pointerInfluence: number
  wingFlutterIntensity: number
  accentColor: number
  fogDensity: number
  sceneDepth: number
  /** Half-width of forest placement on X (full span ≈ 2× this) */
  forestHalfWidth: number
  maxPixelRatio: number
  pointerSmoothing: number
  groundGridDivisions: number
}

export const DEFAULT_AVIARY_TUNING: OrigamiAviaryTuning = {
  seed: 0x41766972,
  birdCount: 8,
  sculpturalBirdCount: 3,
  treeCount: 15,
  branchDepth: 5,
  latticePanelCount: 3,
  suspendedLineCount: 8,
  vineConnectionCount: 5,
  particleCount: 300,
  particleIntensity: 0.48,
  lightColumnCount: 4,
  ceilingArcCount: 8,
  portalFrameCount: 4,
  floorGuideCount: 7,
  atmosphereDrift: 0.85,
  glowPassStrength: 0,
  bloomStrength: 0.26,
  bloomRadius: 0.38,
  bloomThreshold: 0.18,
  lineWidth: 1.1,
  gridOpacity: 0.09,
  lineOpacity: 0.17,
  animationIntensity: 0.92,
  parallaxIntensity: 0.42,
  scrollDriftIntensity: 0.52,
  scrollRotateIntensity: 0.62,
  scrollSmoothing: 6,
  pointerInfluence: 0.5,
  pointerSmoothing: 11,
  wingFlutterIntensity: 0.88,
  accentColor: 0x7a9a6e,
  fogDensity: 0.013,
  sceneDepth: 16,
  forestHalfWidth: 26,
  maxPixelRatio: 1.25,
  groundGridDivisions: 30,
}

export const AVIARY_COLORS = {
  background: 0x0a0a0b,
  fog: 0x0a0a0b,
  lineMuted: 0x4d6350,
  lineAccent: 0x5f7a58,
  birdFill: 0x121a14,
} as const

export function getResponsiveAviaryTuning(): OrigamiAviaryTuning {
  if (typeof window === 'undefined') return { ...DEFAULT_AVIARY_TUNING }

  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = window.devicePixelRatio ?? 1
  const reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches

  const t: OrigamiAviaryTuning = { ...DEFAULT_AVIARY_TUNING }
  const aspect = w / Math.max(h, 1)
  t.forestHalfWidth = 7 + aspect * 11.5

  if (reducedMotion) {
    t.scrollRotateIntensity = 0
    t.parallaxIntensity = 0.2
    t.scrollDriftIntensity = 0.12
    t.animationIntensity = 0.55
    t.wingFlutterIntensity = 0.5
    t.particleIntensity *= 0.45
    t.bloomStrength = 0.1
    t.atmosphereDrift = 0
  }

  if (w < 480 || reducedData) {
    t.birdCount = 4
    t.sculpturalBirdCount = 1
    t.treeCount = 9
    t.branchDepth = 4
    t.latticePanelCount = 2
    t.suspendedLineCount = 6
    t.vineConnectionCount = 3
    t.particleCount = 100
    t.particleIntensity = 0.4
    t.lightColumnCount = 2
    t.ceilingArcCount = 4
    t.portalFrameCount = 2
    t.floorGuideCount = 5
    t.glowPassStrength = 0
    t.bloomStrength = 0.18
    t.lineWidth = 1
    t.groundGridDivisions = 16
    t.gridOpacity = 0.08
    t.maxPixelRatio = 1
    t.parallaxIntensity = 0.32
    t.scrollDriftIntensity = 0.34
    t.scrollRotateIntensity = 0.38
    t.pointerInfluence = 0.55
    t.wingFlutterIntensity = 0.75
    t.animationIntensity = 0.82
  } else if (w < 768 || coarse) {
    t.birdCount = 6
    t.sculpturalBirdCount = 2
    t.treeCount = 12
    t.branchDepth = 4
    t.latticePanelCount = 4
    t.vineConnectionCount = 4
    t.particleCount = 220
    t.particleIntensity = 0.48
    t.lightColumnCount = 3
    t.ceilingArcCount = 6
    t.portalFrameCount = 3
    t.glowPassStrength = 0
    t.bloomStrength = 0.26
    t.lineWidth = 1.05
    t.maxPixelRatio = Math.min(1, dpr)
    t.parallaxIntensity = 0.38
    t.scrollDriftIntensity = 0.4
    t.scrollRotateIntensity = 0.48
  } else if (w < 1100) {
    t.birdCount = 7
    t.sculpturalBirdCount = 2
    t.treeCount = 14
    t.particleCount = 320
    t.particleIntensity = 0.52
    t.maxPixelRatio = Math.min(1.25, dpr)
  } else {
    t.maxPixelRatio = Math.min(t.maxPixelRatio, dpr)
    if (aspect > 1.9) t.treeCount = 18
  }

  return t
}
