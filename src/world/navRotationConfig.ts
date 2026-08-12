/** Nav-triggered world spin — random angle in [minDegrees, maxDegrees]. */
export const NAV_ROTATION_CONFIG = {
  durationMs: 1900,
  minDegrees: 50,
  maxDegrees: 90,
  /** Max extra FOV (degrees) while framing a spin. */
  fovBoostMax: 20,
  /** Max camera pull-back (world units) while framing a spin. */
  cameraPullbackMax: 2.2,
  /** Smoothing rate while the spin is active. */
  cameraSmoothing: 10,
  /** Slower smoothing when framing eases back after the spin lands. */
  cameraReleaseSmoothing: 2.4,
  /** Normalized progress where the landing tail begins (rotation + framing soften). */
  landingTailStart: 0.62,
} as const

const TAU = Math.PI * 2
const DEG = Math.PI / 180

export function normalizeRadians(radians: number): number {
  return ((radians % TAU) + TAU) % TAU
}

export function randomNavSpinDelta(): number {
  const { minDegrees, maxDegrees } = NAV_ROTATION_CONFIG
  const degrees = minDegrees + Math.random() * (maxDegrees - minDegrees)
  const sign = Math.random() < 0.5 ? -1 : 1
  return degrees * DEG * sign
}

/** Smootherstep — zero velocity and acceleration at both ends. */
export function navSpinEase(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function smoothstep01(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return x * x * (3 - 2 * x)
}

/**
 * Framing weight — rises through the move, then glides back to zero before the spin finishes
 * so the landing feels quiet rather than snapping.
 */
export function navSpinFramingWeight(progress: number): number {
  if (progress <= 0 || progress >= 1) return 0

  const eased = navSpinEase(progress)
  const body = Math.sin(Math.PI * eased)

  const { landingTailStart } = NAV_ROTATION_CONFIG
  if (progress <= landingTailStart) return body

  const tailT = (progress - landingTailStart) / (1 - landingTailStart)
  const tailFade = 1 - smoothstep01(tailT)
  return body * tailFade * tailFade
}

/** Estimate framing needs for a spin arc (no per-frame camera fighting). */
export function estimateSpinFraming(
  deltaRadians: number,
  forestHalfWidth: number,
  sceneDepth: number,
): { fovBoost: number; zPull: number } {
  const arc = Math.abs(deltaRadians)
  const arcDeg = arc / DEG
  const sizeFactor = Math.min(1.35, forestHalfWidth / 42 + sceneDepth / 28)
  const fovBoost = Math.min(
    NAV_ROTATION_CONFIG.fovBoostMax,
    (6 + arcDeg * 0.055) * sizeFactor,
  )
  const zPull = Math.min(
    NAV_ROTATION_CONFIG.cameraPullbackMax,
    (0.55 + arcDeg * 0.0065) * sizeFactor,
  )
  return { fovBoost, zPull }
}
