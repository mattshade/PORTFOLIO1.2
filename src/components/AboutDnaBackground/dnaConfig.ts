export type AboutDnaConfig = {
  color: string
  colorMuted: string
  strandOpacity: number
  backboneLineWidth: number
  stalkHeight: number
  yCenter: number
  /** Extra world-units of stem below u=0 before scaleY */
  stalkBelowExtra: number
  /** Extra world Y pan at scroll end so the base meets the footer */
  stalkPanEndBoost: number
  /** Lifts initial pan so the stalk top sits near the About text block */
  stalkPanStartBias: number
  stalkOffsetX: number
  scaleXZ: number
  scaleY: number
  waveCount: number
  snakeSway: number
  radiusVar: number
  samples: number
  filamentCount: number
  helixRadius: number
  helixTurns: number
  /** Full 360° rotations of the helix from twist progress 0 → 1 */
  scrollHelixTurns: number
  chaseHelixSpeed: number
  wrapperCount: number
  wrapperRadiusScales: number[]
  wrapperFilaments: number[]
  wrapperTurnScales: number[]
  wrapperLineWidth: number
  wrapperOpacity: number
  leafCount: number
  leafSize: number
  leafLineWidth: number
  leafOpacity: number
  branchCount: number
  branchLength: number
  branchLineWidth: number
  branchOpacity: number
  /** Thin helical sprays wrapping the stalk */
  swirlBranchCount: number
  swirlBranchSteps: number
  swirlBranchHelixTurns: number
  swirlBranchLineWidth: number
  swirlBranchOpacity: number
  /** Open artichoke-like bract crown at the stalk base */
  artichokeRingCount: number
  artichokeBractsPerRing: number
  artichokeBractRingStep: number
  artichokeMaxU: number
  artichokeOpacity: number
  artichokeLineWidth: number
  artichokeScale: number
  /** Luminous points scattered through the stalk volume */
  stalkDotCount: number
  stalkDotSize: number
  stalkDotOpacity: number
  cameraPadding: number
  verticalPanTop: number
  verticalPanRange: number
  batCount: number
  flyingBatCount: number
  batPerchPool: number
  batLineOpacity: number
  batScale: number
}

const DESKTOP: AboutDnaConfig = {
  color: '#5ec4dc',
  colorMuted: '#3d6a78',
  strandOpacity: 0.64,
  backboneLineWidth: 1.08,
  stalkHeight: 20,
  yCenter: 0.58,
  stalkBelowExtra: 2,
  stalkPanEndBoost: 0.85,
  stalkPanStartBias: 2.8,
  stalkOffsetX: 2.05,
  scaleXZ: 0.96,
  scaleY: 1.36,
  waveCount: 3.15,
  snakeSway: 0.58,
  radiusVar: 0,
  samples: 380,
  filamentCount: 2,
  helixRadius: 0.9,
  helixTurns: 9.2,
  scrollHelixTurns: 3.4,
  chaseHelixSpeed: 0.38,
  wrapperCount: 3,
  wrapperRadiusScales: [1.55, 1.95, 2.38],
  wrapperFilaments: [3, 3, 2],
  wrapperTurnScales: [1.02, 0.96, 0.9],
  wrapperLineWidth: 0.56,
  wrapperOpacity: 0.44,
  stalkDotCount: 220,
  stalkDotSize: 1.15,
  stalkDotOpacity: 0.68,
  leafCount: 52,
  leafSize: 0.11,
  leafLineWidth: 0.72,
  leafOpacity: 0.54,
  branchCount: 22,
  branchLength: 0.34,
  branchLineWidth: 0.56,
  branchOpacity: 0.5,
  swirlBranchCount: 62,
  swirlBranchSteps: 24,
  swirlBranchHelixTurns: 1.9,
  swirlBranchLineWidth: 0.5,
  swirlBranchOpacity: 0.46,
  artichokeRingCount: 7,
  artichokeBractsPerRing: 13,
  artichokeBractRingStep: 3,
  artichokeMaxU: 0.16,
  artichokeOpacity: 0.52,
  artichokeLineWidth: 0.5,
  artichokeScale: 1.32,
  cameraPadding: 0.45,
  verticalPanTop: 0,
  verticalPanRange: 1,
  batCount: 6,
  flyingBatCount: 3,
  batPerchPool: 52,
  batLineOpacity: 0.58,
  batScale: 2.05,
}

/** Lightweight vine for fragile GPUs — rendered inside the main aviary canvas. */
const FRAGILE_EMBED: AboutDnaConfig = {
  ...MOBILE,
  strandOpacity: 0.54,
  backboneLineWidth: 1.05,
  stalkHeight: 14,
  yCenter: 0.52,
  stalkBelowExtra: 1.4,
  stalkPanStartBias: 2.4,
  stalkOffsetX: 1.35,
  scaleXZ: 0.74,
  scaleY: 1.12,
  waveCount: 2.4,
  snakeSway: 0.38,
  samples: 96,
  filamentCount: 1,
  helixRadius: 0.58,
  helixTurns: 5.4,
  scrollHelixTurns: 2.35,
  wrapperCount: 1,
  wrapperRadiusScales: [1.42],
  wrapperFilaments: [2],
  wrapperTurnScales: [0.95],
  wrapperLineWidth: 0.5,
  wrapperOpacity: 0.36,
  leafCount: 0,
  branchCount: 0,
  swirlBranchCount: 0,
  artichokeRingCount: 0,
  artichokeBractsPerRing: 0,
  stalkDotCount: 0,
  batCount: 0,
  flyingBatCount: 0,
  batPerchPool: 0,
}

const MOBILE: AboutDnaConfig = {
  ...DESKTOP,
  strandOpacity: 0.56,
  backboneLineWidth: 0.88,
  stalkHeight: 17,
  yCenter: 0.54,
  stalkBelowExtra: 1.8,
  stalkPanStartBias: 3.8,
  stalkOffsetX: 1.55,
  scaleXZ: 0.86,
  scaleY: 1.28,
  waveCount: 2.85,
  snakeSway: 0.48,
  samples: 280,
  filamentCount: 2,
  helixRadius: 0.72,
  helixTurns: 7.6,
  scrollHelixTurns: 2.6,
  leafCount: 34,
  branchCount: 14,
  swirlBranchCount: 36,
  stalkDotCount: 140,
  stalkDotSize: 1.02,
  stalkDotOpacity: 0.6,
  wrapperOpacity: 0.38,
  swirlBranchOpacity: 0.4,
  artichokeRingCount: 5,
  artichokeBractsPerRing: 10,
  artichokeBractRingStep: 2,
  artichokeMaxU: 0.13,
  artichokeOpacity: 0.44,
  artichokeLineWidth: 0.44,
  artichokeScale: 1.14,
  wrapperRadiusScales: [1.52, 1.88, 2.28],
  batCount: 4,
  flyingBatCount: 2,
  batPerchPool: 40,
  batLineOpacity: 0.52,
  batScale: 1.85,
  verticalPanTop: 0,
  verticalPanRange: 1,
}

export function getStalkVerticalBounds(cfg: AboutDnaConfig): { yMin: number; yMax: number } {
  const yMin = (-cfg.yCenter * cfg.stalkHeight - (cfg.stalkBelowExtra ?? 0)) * cfg.scaleY
  const yMax = (1 - cfg.yCenter) * cfg.stalkHeight * cfg.scaleY
  return { yMin, yMax }
}

export type AboutDnaTier = 'desktop' | 'mobile' | 'fragile-embed'

export function getAboutDnaConfig(tier: AboutDnaTier): AboutDnaConfig {
  if (tier === 'fragile-embed') return FRAGILE_EMBED
  if (tier === 'mobile') return MOBILE
  return DESKTOP
}

/** @deprecated Use getAboutDnaConfig(tier) */
export function getAboutDnaConfigForViewport(isNarrow: boolean): AboutDnaConfig {
  return getAboutDnaConfig(isNarrow ? 'mobile' : 'desktop')
}

export function getSnakeVerticalHalfExtent(cfg: AboutDnaConfig): number {
  const { yMin, yMax } = getStalkVerticalBounds(cfg)
  return Math.max(-yMin, yMax) * 1.04
}

export function getStalkCenterX(cfg: AboutDnaConfig): number {
  return (cfg.stalkOffsetX + cfg.snakeSway * 0.5) * cfg.scaleXZ
}
