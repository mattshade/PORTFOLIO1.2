import * as THREE from 'three'
import type { AboutDnaConfig } from './dnaConfig'

export type StrandPoint = { x: number; y: number; z: number }

export type SpineSample = {
  u: number
  /** Normalized arc-length (0–1) — use for helix angle so stripes stay evenly spaced on curves */
  arcS: number
  center: StrandPoint
  normal: THREE.Vector3
  binormal: THREE.Vector3
  tangent: THREE.Vector3
  radius: number
}

const _tangent = new THREE.Vector3()
const _normal = new THREE.Vector3()
const _binormal = new THREE.Vector3()
const _ref = new THREE.Vector3(0, 1, 0)

/** Soft cap at the top only — never taper the base (that made the stalk look short and faint) */
export function stalkTopFade(u: number): number {
  const topBand = 0.03
  if (u < topBand) return THREE.MathUtils.smoothstep(0, topBand, u)
  return 1
}

/** @deprecated Use stalkTopFade — kept for call sites during transition */
export function stalkEndFade(u: number): number {
  return stalkTopFade(u)
}

function snakeCenter(u: number, cfg: AboutDnaConfig, pathPhase = 0): StrandPoint {
  const phase = u * cfg.waveCount * Math.PI * 2 + pathPhase
  const sway = Math.sin(phase) * cfg.snakeSway * 0.52
  const z = Math.sin(phase * 1.28 + pathPhase * 0.55) * cfg.snakeSway * 0.26
  const below = (cfg.stalkBelowExtra ?? 0) * (1 - u)
  return {
    x: cfg.stalkOffsetX + sway,
    y: (u - cfg.yCenter) * cfg.stalkHeight - below,
    z,
  }
}

export function buildSpineSamples(cfg: AboutDnaConfig, pathPhase = 0): SpineSample[] {
  const centers: StrandPoint[] = []
  for (let i = 0; i <= cfg.samples; i++) {
    centers.push(snakeCenter(i / cfg.samples, cfg, pathPhase))
  }

  const arcLen: number[] = [0]
  let total = 0
  for (let i = 1; i < centers.length; i++) {
    const a = centers[i - 1]
    const b = centers[i]
    total += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z)
    arcLen.push(total)
  }
  const invTotal = total > 1e-8 ? 1 / total : 1

  const samples: SpineSample[] = []
  for (let i = 0; i <= cfg.samples; i++) {
    const u = i / cfg.samples
    const eps = 1 / Math.max(160, cfg.samples * 2)
    const u0 = THREE.MathUtils.clamp(u - eps, 0, 1)
    const u1 = THREE.MathUtils.clamp(u + eps, 0, 1)
    const a = snakeCenter(u0, cfg, pathPhase)
    const b = snakeCenter(u1, cfg, pathPhase)
    const center = centers[i]

    _tangent.set(b.x - a.x, b.y - a.y, b.z - a.z)
    if (_tangent.lengthSq() < 1e-8) _tangent.set(0, 1, 0)
    _tangent.normalize()

    _normal.crossVectors(_tangent, _ref)
    if (_normal.lengthSq() < 0.04) _normal.crossVectors(_tangent, new THREE.Vector3(1, 0, 0))
    _normal.normalize()
    _binormal.crossVectors(_tangent, _normal).normalize()

    samples.push({
      u,
      arcS: arcLen[i] * invTotal,
      center,
      normal: _normal.clone(),
      binormal: _binormal.clone(),
      tangent: _tangent.clone(),
      radius: cfg.helixRadius,
    })
  }
  return samples
}

export function scaleSpineRadii(spine: SpineSample[], scale: number): SpineSample[] {
  return spine.map((s) => ({ ...s, radius: s.radius * scale }))
}

export function sampleHelixFilament(
  spine: SpineSample[],
  cfg: AboutDnaConfig,
  options: {
    filamentIndex: number
    filamentCount: number
    helixPhase: number
    helixTurns: number
    phaseOffset?: number
  },
): StrandPoint[] {
  const { filamentIndex, filamentCount, helixPhase, helixTurns, phaseOffset = 0 } = options
  const filamentPhase = (filamentIndex / filamentCount) * Math.PI * 2
  const points: StrandPoint[] = []
  for (const s of spine) {
    const helixAngle = s.arcS * helixTurns * Math.PI * 2 + filamentPhase + helixPhase + phaseOffset
    const c = Math.cos(helixAngle)
    const sn = Math.sin(helixAngle)
    const r = s.radius
    points.push({
      x: s.center.x + r * (c * s.normal.x + sn * s.binormal.x),
      y: s.center.y + r * (c * s.normal.y + sn * s.binormal.y),
      z: s.center.z + r * (c * s.normal.z + sn * s.binormal.z),
    })
  }
  return points
}

export function spineAtU(spine: SpineSample[], u: number): SpineSample {
  const idx = THREE.MathUtils.clamp(Math.round(u * (spine.length - 1)), 0, spine.length - 1)
  return spine[idx]
}
