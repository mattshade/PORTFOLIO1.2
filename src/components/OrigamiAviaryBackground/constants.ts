/**
 * Tunable aviary atmosphere — aligned with site `--bg` / muted green blueprint language.
 */
export type PosterHeroBirdSlot = 'upperLeft' | 'upperRight'

export type AviaryViewportProfile = 'narrow' | 'tablet' | 'desktop'

export function getAviaryViewportProfile(w: number): AviaryViewportProfile {
  if (w <= 768) return 'narrow'
  if (w < 1100) return 'tablet'
  return 'desktop'
}

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
  /** Narrow / “poster crop” composition: one hero crane + sparse flock, simplified forest */
  posterComposition: boolean
  /** Hero crane biased into upper / lateral space (off title axis) */
  posterHeroBirdSlot: PosterHeroBirdSlot
  /** Extra trees parked in mid-ground fill pass (fraction of treeCount) */
  forestCenterFillFraction: number
  /** Multiplier on primary limb splits per tree */
  forestLimbDensity: number
  /** 1 = full twigs/vines/canopy dice; lower reduces fine branching */
  forestFineDetail: number
  /** Scales organic root spur count at trunk base */
  forestRootDensity: number
  /** Applied on top of sculptural base scale */
  heroBirdScaleMul: number
  heroBirdEdgeOpacityMul: number
  heroBirdFillOpacityMul: number
  /** Supporting flock: smaller, muted vs hero */
  flockBirdScaleMul: number
  flockBirdEdgeOpacityMul: number
  flockBirdFillOpacityMul: number
  /** Extra negative Z for flock perches (deeper fog) */
  posterFlockZPush: number

  viewportProfile: AviaryViewportProfile
  /** True when layout is touch-first: phones or coarse pointer */
  touchPrimary: boolean
  baseFov: number
  /** Added to {@link BOTTOM_ANCHOR_CAMERA} on init */
  cameraOffsetX: number
  cameraOffsetY: number
  cameraOffsetZ: number
  /** Added to look-at target Y */
  lookAtOffsetY: number
  /** Subtracted from FoV when portrait (`aspect < 1`) on narrow profile */
  portraitFovTrim: number
  /** Allow hero birds to swoop toward the camera */
  viewerApproachEnabled: boolean
  /** Min |x| as fraction of forest half-width for hero perch scoring / off-center filter */
  heroPerchMinCenterFraction: number
  /** Multiplier on pointer-driven camera / layer translation parallax */
  pointerParallaxScale: number
  /** Multiplier on pointer-driven Y/X rotation of depth layers (0 = disable) */
  layerPointerRotationScale: number
  /** Multiplier on scroll-driven camera offsets inside pointer parallax */
  touchScrollScale: number
  /** Extra scale on first hero silhouettes on narrow viewports */
  heroSilhouetteBoost: number
  /** Scales lattice panels, vine bridges, and suspended lines in the forest pass */
  forestArchitectureDensity: number
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
  posterComposition: false,
  posterHeroBirdSlot: 'upperLeft',
  forestCenterFillFraction: 0.28,
  forestLimbDensity: 1,
  forestFineDetail: 1,
  forestRootDensity: 1,
  heroBirdScaleMul: 1,
  heroBirdEdgeOpacityMul: 1,
  heroBirdFillOpacityMul: 1,
  flockBirdScaleMul: 1,
  flockBirdEdgeOpacityMul: 1,
  flockBirdFillOpacityMul: 1,
  posterFlockZPush: 0,

  viewportProfile: 'desktop',
  touchPrimary: false,
  baseFov: 43,
  cameraOffsetX: 0,
  cameraOffsetY: 0,
  cameraOffsetZ: 0,
  lookAtOffsetY: 0,
  portraitFovTrim: 0,
  viewerApproachEnabled: true,
  heroPerchMinCenterFraction: 0.12,
  pointerParallaxScale: 1,
  layerPointerRotationScale: 1,
  touchScrollScale: 1,
  heroSilhouetteBoost: 1,
  forestArchitectureDensity: 1,
}

export const AVIARY_COLORS = {
  background: 0x0a0a0b,
  fog: 0x0a0a0b,
  lineMuted: 0x4d6350,
  lineAccent: 0x5f7a58,
  birdFill: 0x121a14,
} as const

function posterHeroSlotFromSeed(seed: number): PosterHeroBirdSlot {
  let h = seed >>> 0
  h ^= h << 13
  h ^= h >>> 17
  h ^= h << 5
  return (h & 1) === 0 ? 'upperLeft' : 'upperRight'
}

export function getResponsiveAviaryTuning(): OrigamiAviaryTuning {
  if (typeof window === 'undefined') return { ...DEFAULT_AVIARY_TUNING }

  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = window.devicePixelRatio ?? 1
  const reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  const t: OrigamiAviaryTuning = { ...DEFAULT_AVIARY_TUNING }
  const aspect = w / Math.max(h, 1)
  t.forestHalfWidth = 7 + aspect * 11.5

  t.viewportProfile = getAviaryViewportProfile(w)
  t.touchPrimary = w <= 768 || coarsePointer

  const narrowPoster = w <= 768
  const phone = w < 480

  if (narrowPoster) {
    const touchPrimary = t.touchPrimary
    Object.assign(t, {
      posterComposition: true,
      posterHeroBirdSlot: posterHeroSlotFromSeed(t.seed),
      sculpturalBirdCount: 1,
      birdCount: phone ? 1 : 2,
      treeCount: phone ? 6 : 8,
      branchDepth: phone ? 3 : 4,
      latticePanelCount: phone ? 0 : 1,
      suspendedLineCount: phone ? 3 : 4,
      vineConnectionCount: phone ? 1 : 2,
      particleCount: phone ? 72 : 120,
      particleIntensity: phone ? 0.32 : 0.36,
      lightColumnCount: phone ? 1 : 2,
      ceilingArcCount: phone ? 3 : 5,
      portalFrameCount: phone ? 1 : 2,
      floorGuideCount: phone ? 4 : 5,
      glowPassStrength: 0,
      bloomStrength: phone ? 0.08 : 0.1,
      bloomRadius: phone ? 0.24 : 0.3,
      lineWidth: phone ? 1.48 : 1.38,
      lineOpacity: phone ? 0.22 : 0.2,
      gridOpacity: phone ? 0.075 : 0.078,
      groundGridDivisions: phone ? 12 : 14,
      maxPixelRatio: 1,
      fogDensity: phone ? 0.011 : 0.0118,
      forestCenterFillFraction: phone ? 0.06 : 0.1,
      forestLimbDensity: phone ? 0.5 : 0.62,
      forestFineDetail: phone ? 0.35 : 0.48,
      forestRootDensity: phone ? 0.5 : 0.6,
      forestArchitectureDensity: phone ? 0.68 : 0.78,
      heroBirdScaleMul: phone ? 1.48 : 1.38,
      heroBirdEdgeOpacityMul: phone ? 1.22 : 1.16,
      heroBirdFillOpacityMul: phone ? 1.1 : 1.06,
      flockBirdScaleMul: phone ? 0.72 : 0.8,
      flockBirdEdgeOpacityMul: phone ? 0.88 : 0.92,
      flockBirdFillOpacityMul: phone ? 0.86 : 0.9,
      posterFlockZPush: phone ? -1.45 : -1.05,
      parallaxIntensity: phone ? 0.18 : 0.24,
      scrollDriftIntensity: phone ? 0.18 : 0.24,
      scrollRotateIntensity: phone ? 0.18 : 0.26,
      animationIntensity: phone ? 0.48 : 0.56,
      wingFlutterIntensity: phone ? 0.38 : 0.46,
      pointerInfluence: phone ? 0.42 : 0.46,
      scrollSmoothing: phone ? 7.5 : 7,
      baseFov: phone ? 44 : 43.5,
      cameraOffsetZ: phone ? -0.95 : -0.72,
      cameraOffsetY: phone ? 0.12 : 0.08,
      lookAtOffsetY: phone ? 0.06 : 0.04,
      portraitFovTrim: phone ? 2.6 : 2.1,
      viewerApproachEnabled: false,
      heroPerchMinCenterFraction: phone ? 0.32 : 0.28,
      heroSilhouetteBoost: phone ? 1.16 : 1.12,
      pointerParallaxScale: touchPrimary ? 0.14 : 0.55,
      layerPointerRotationScale: touchPrimary ? 0 : 0.35,
      touchScrollScale: touchPrimary ? 0.5 : 0.72,
    })

    if (reducedData) {
      t.particleCount = Math.min(t.particleCount, 80)
      t.suspendedLineCount = Math.min(t.suspendedLineCount, 3)
      t.vineConnectionCount = Math.min(t.vineConnectionCount, 1)
      t.bloomStrength = Math.min(t.bloomStrength, 0.06)
    }
  } else if (w < 1100) {
    t.viewportProfile = 'tablet'
    t.birdCount = 7
    t.sculpturalBirdCount = 2
    t.treeCount = 14
    t.particleCount = 320
    t.particleIntensity = 0.52
    t.maxPixelRatio = Math.min(1.25, dpr)
    if (coarsePointer) {
      t.pointerParallaxScale = 0.55
      t.layerPointerRotationScale = 0.45
      t.touchScrollScale = 0.78
    }
  } else {
    t.maxPixelRatio = Math.min(t.maxPixelRatio, dpr)
    if (aspect > 1.9) t.treeCount = 18
  }

  if (reducedMotion) {
    t.scrollRotateIntensity = 0
    t.parallaxIntensity = Math.min(t.parallaxIntensity, 0.2)
    t.scrollDriftIntensity = Math.min(t.scrollDriftIntensity, 0.12)
    t.animationIntensity = Math.min(t.animationIntensity, 0.55)
    t.wingFlutterIntensity = Math.min(t.wingFlutterIntensity, 0.5)
    t.particleIntensity *= 0.45
    t.bloomStrength = Math.min(t.bloomStrength, 0.1)
    t.atmosphereDrift = 0
  }

  return t
}
