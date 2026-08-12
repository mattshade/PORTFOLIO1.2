import { isFragileWebGLDevice } from './webglCapabilities'

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
  /** Full forest revolutions (360° × n) from page top to bottom on the spin pivot. */
  scrollForestRevolutions: number
  scrollSmoothing: number
  pointerInfluence: number
  wingFlutterIntensity: number
  accentColor: number
  fogDensity: number
  sceneDepth: number
  /** Outer radius of the 360° forest ring (world units). */
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
  /** Extra trees in the far depth band (fraction of treeCount). */
  forestDeepFillFraction: number
  /** Scales lattice panels, vine bridges, and suspended lines in the forest pass */
  forestArchitectureDensity: number
  /** Extra trees along the left/right forest edge (fraction of treeCount). */
  forestEdgeFillFraction: number
  /** Canopy bats — line origami silhouettes */
  batCount: number
  flyingBatCount: number
  batScale: number
}

export const DEFAULT_AVIARY_TUNING: OrigamiAviaryTuning = {
  seed: 0x41766972,
  birdCount: 18,
  sculpturalBirdCount: 5,
  treeCount: 76,
  branchDepth: 5,
  latticePanelCount: 3,
  suspendedLineCount: 8,
  vineConnectionCount: 5,
  particleCount: 220,
  particleIntensity: 0.34,
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
  gridOpacity: 0.048,
  lineOpacity: 0.17,
  animationIntensity: 0.92,
  parallaxIntensity: 0.42,
  scrollDriftIntensity: 0.68,
  scrollRotateIntensity: 0.58,
  scrollForestRevolutions: 0.3,
  scrollSmoothing: 3.85,
  pointerInfluence: 0.5,
  pointerSmoothing: 11,
  wingFlutterIntensity: 0.88,
  accentColor: 0x7a9a6e,
  fogDensity: 0.0105,
  sceneDepth: 28,
  forestHalfWidth: 22,
  maxPixelRatio: 1.25,
  groundGridDivisions: 42,
  posterComposition: false,
  posterHeroBirdSlot: 'upperLeft',
  forestCenterFillFraction: 0.68,
  forestLimbDensity: 1.18,
  forestFineDetail: 1.12,
  forestRootDensity: 1,
  forestDeepFillFraction: 0.4,
  heroBirdScaleMul: 1,
  heroBirdEdgeOpacityMul: 1,
  heroBirdFillOpacityMul: 1,
  flockBirdScaleMul: 1,
  flockBirdEdgeOpacityMul: 1,
  flockBirdFillOpacityMul: 1,
  posterFlockZPush: 0,

  viewportProfile: 'desktop',
  touchPrimary: false,
  baseFov: 39,
  cameraOffsetX: 0,
  cameraOffsetY: 0.04,
  cameraOffsetZ: -1.05,
  lookAtOffsetY: 0.14,
  portraitFovTrim: 0,
  viewerApproachEnabled: true,
  heroPerchMinCenterFraction: 0.12,
  pointerParallaxScale: 1,
  layerPointerRotationScale: 1,
  touchScrollScale: 1,
  heroSilhouetteBoost: 1,
  forestArchitectureDensity: 1,
  forestEdgeFillFraction: 0.58,
  batCount: 5,
  flyingBatCount: 2,
  batScale: 1.22,
}

export const AVIARY_COLORS = {
  background: 0x0a0a0b,
  fog: 0x0a0a0b,
  lineMuted: 0x4d6350,
  lineAccent: 0x5f7a58,
  birdFill: 0x121a14,
} as const

/** Origami cat tree climb / leap strike (see `origamiCat` states `approach_tree`, `climbing`, `tree_leap`). */
export const CAT_TREE_TUNING = {
  climbCooldownMin: 14,
  climbCooldownMax: 38,
  climbEvaluatePeriod: 1.6,
  climbPickChance: 0.68,
  /** When a bird is visible on a tree, climb evaluation uses this higher pick chance. */
  climbPickChanceWithPrey: 0.88,
  maxPerchPickDistanceXZ: 13,
  minPerchPickDistanceXZ: 0.85,
  approachXZThreshold: 0.42,
  climbRate: 0.72,
  climbBelowPerch: 0.13,
  climbXZPull: 0.22,
  leapTriggerDistance: 1.35,
  leapDurationMin: 0.38,
  leapDurationMax: 0.52,
  leapArcHeight: 0.42,
  /** Sideways jump off the tree after a climb (not straight down). */
  sideDismountDistanceMin: 0.95,
  sideDismountDistanceMax: 1.72,
  sideDismountArcHeight: 0.44,
  /** Root pitch (rad) when fully on the trunk — negative tilts nose up. */
  climbPitchRad: 0.82,
  climbWalkCycleSpeed: 2.9,
  climbLegStride: 0.56,
  /** Hard ceiling on cat root Y per viewport — climb/leap/sanitize never exceed this (keeps cat on-camera). */
  catVisibleMaxY: {
    narrow: 2.52,
    tablet: 2.92,
    desktop: 3.28,
  } as const,
  /** Idle / patrol vertical band (world Y). */
  catGroundMinY: 0.045,
  catGroundMaxY: 0.17,
  /** Nominal feet-on-ground root Y (grid/horizon at ~0; matches approach/descend targets). */
  catSpawnGroundY: 0.055,
  /** Extra slack above climb target for sanitize during `approach_tree` / `climbing`. */
  catClimbSanitizeMargin: 0.2,
  /** Ground pounce arc height cap uses the smaller of this and remaining headroom under {@link catVisibleMaxY}. */
  pounceArcHeight: 0.32,
  /** When |x|/halfX exceeds this, gently pull toward center (narrow profile only). */
  catFrustumEdgeNudgeStart: 0.86,
  catFrustumEdgeNudgeSpeed: 1.15,
  /** Max XZ distance at which the cat will orient and walk toward resting birds. */
  huntAwarenessXZ: 15,
  /** XZ distance to begin low stalk toward prey. */
  huntStalkRadiusXZ: 4.6,
} as const

export function catVisibleMaxYForProfile(vp: AviaryViewportProfile): number {
  if (vp === 'narrow') return CAT_TREE_TUNING.catVisibleMaxY.narrow
  if (vp === 'tablet') return CAT_TREE_TUNING.catVisibleMaxY.tablet
  return CAT_TREE_TUNING.catVisibleMaxY.desktop
}

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
  const fragileGpu = isFragileWebGLDevice()
  const h = window.innerHeight
  const dpr = window.devicePixelRatio ?? 1
  const reducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  const t: OrigamiAviaryTuning = { ...DEFAULT_AVIARY_TUNING }
  const aspect = w / Math.max(h, 1)
  t.forestHalfWidth = 8.5 + aspect * 13.5
  t.sceneDepth = aspect > 1.35 ? 34 : 30

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
      birdCount: phone ? 5 : 7,
      treeCount: phone ? 28 : 34,
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
      gridOpacity: phone ? 0.04 : 0.044,
      groundGridDivisions: phone ? 16 : 18,
      maxPixelRatio: 1,
      fogDensity: phone ? 0.0095 : 0.0102,
      forestCenterFillFraction: phone ? 0.52 : 0.58,
      forestLimbDensity: phone ? 0.5 : 0.62,
      forestFineDetail: phone ? 0.35 : 0.48,
      forestRootDensity: phone ? 0.5 : 0.6,
      forestArchitectureDensity: phone ? 0.68 : 0.78,
      forestEdgeFillFraction: phone ? 0.46 : 0.52,
      forestDeepFillFraction: phone ? 0.3 : 0.36,
      heroBirdScaleMul: phone ? 1.48 : 1.38,
      heroBirdEdgeOpacityMul: phone ? 1.22 : 1.16,
      heroBirdFillOpacityMul: phone ? 1.1 : 1.06,
      flockBirdScaleMul: phone ? 0.72 : 0.8,
      flockBirdEdgeOpacityMul: phone ? 0.88 : 0.92,
      flockBirdFillOpacityMul: phone ? 0.86 : 0.9,
      posterFlockZPush: phone ? -1.45 : -1.05,
      batCount: phone ? 2 : 3,
      flyingBatCount: 1,
      batScale: phone ? 1.08 : 1.14,
      parallaxIntensity: touchPrimary ? (phone ? 0.14 : 0.18) : phone ? 0.18 : 0.24,
      scrollDriftIntensity: touchPrimary ? 0.48 : phone ? 0.54 : 0.62,
      scrollRotateIntensity: touchPrimary ? (phone ? 0.42 : 0.48) : phone ? 0.48 : 0.52,
      scrollForestRevolutions: phone ? 0.26 : 0.28,
      animationIntensity: phone ? 0.48 : 0.56,
      wingFlutterIntensity: phone ? 0.38 : 0.46,
      pointerInfluence: phone ? 0.42 : 0.46,
      scrollSmoothing: touchPrimary ? 5.5 : phone ? 5 : 4.6,
      baseFov: phone ? 44 : 43.5,
      cameraOffsetZ: phone ? -1.35 : -1.15,
      cameraOffsetY: phone ? 0.02 : 0.05,
      lookAtOffsetY: phone ? 0.1 : 0.12,
      portraitFovTrim: phone ? 2.6 : 2.1,
      viewerApproachEnabled: false,
      heroPerchMinCenterFraction: phone ? 0.32 : 0.28,
      heroSilhouetteBoost: phone ? 1.16 : 1.12,
      pointerParallaxScale: touchPrimary ? 0.18 : 0.55,
      layerPointerRotationScale: touchPrimary ? 0.22 : 0.35,
      touchScrollScale: touchPrimary ? 0.44 : 0.72,
    })

    if (reducedData) {
      t.particleCount = Math.min(t.particleCount, 80)
      t.suspendedLineCount = Math.min(t.suspendedLineCount, 3)
      t.vineConnectionCount = Math.min(t.vineConnectionCount, 1)
      t.bloomStrength = Math.min(t.bloomStrength, 0.06)
    }
  } else if (w < 1100) {
    t.viewportProfile = 'tablet'
    t.birdCount = 14
    t.sculpturalBirdCount = 4
    t.treeCount = 58
    t.forestCenterFillFraction = 0.62
    t.forestEdgeFillFraction = 0.52
    t.forestDeepFillFraction = 0.36
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
    if (aspect > 1.9) t.treeCount = 92
  }

  if (reducedMotion) {
    t.scrollRotateIntensity = 0
    t.scrollForestRevolutions = 0
    t.parallaxIntensity = Math.min(t.parallaxIntensity, 0.2)
    t.scrollDriftIntensity = Math.min(t.scrollDriftIntensity, 0.12)
    t.animationIntensity = Math.min(t.animationIntensity, 0.55)
    t.wingFlutterIntensity = Math.min(t.wingFlutterIntensity, 0.5)
    t.particleIntensity *= 0.45
    t.bloomStrength = Math.min(t.bloomStrength, 0.1)
    t.atmosphereDrift = 0
    t.flyingBatCount = 0
  }

  if (fragileGpu) {
    t.maxPixelRatio = Math.min(t.maxPixelRatio, 1)
    t.bloomStrength = 0
    t.particleCount = Math.min(t.particleCount, narrowPoster ? 64 : 180)
    t.treeCount = Math.min(t.treeCount, narrowPoster ? 28 : 52)
    t.scrollRotateIntensity = Math.min(t.scrollRotateIntensity, narrowPoster ? 0.1 : 0.16)
    t.scrollForestRevolutions = Math.min(t.scrollForestRevolutions, narrowPoster ? 0.22 : 0.26)
    t.animationIntensity = Math.min(t.animationIntensity, 0.5)
    t.batCount = Math.min(t.batCount, narrowPoster ? 2 : 3)
    t.flyingBatCount = Math.min(t.flyingBatCount, 1)
  }

  return t
}
