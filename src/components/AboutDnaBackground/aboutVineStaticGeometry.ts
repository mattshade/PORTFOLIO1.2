import * as THREE from 'three'
import { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'
import { buildVineBatPerches } from './aboutDnaBats'
import {
  getAboutDnaConfig,
  getSnakeVerticalHalfExtent,
  getStalkCenterX,
  type AboutDnaConfig,
} from './dnaConfig'
import {
  buildSpineSamples,
  sampleHelixFilament,
  scaleSpineRadii,
  spineAtU,
  stalkTopFade,
  type SpineSample,
  type StrandPoint,
} from './spinePath'
import { getPlantCrossSectionRadius } from './vineFoliage'

const CAMERA_FOV = 38
const CAMERA_LOOK_Y = -0.38
const FOLIAGE_SEED = 0x7a1ec41e
const BAT_SEED = 0xba71ca7e
const VIEW_W = 320
const VIEW_H = 720

export type StaticVinePath = {
  d: string
  opacity: number
  strokeWidth: number
  depth: number
}

export type StaticVineDot = {
  cx: number
  cy: number
  r: number
  opacity: number
  depth: number
}

export type StaticVineBat = {
  paths: string[]
  opacity: number
  depth: number
}

export type AboutVineStaticScene = {
  viewBox: string
  polylines: StaticVinePath[]
  dots: StaticVineDot[]
  bats: StaticVineBat[]
}

export function getAboutDnaStaticArtConfig(): AboutDnaConfig {
  return getAboutDnaConfig('desktop')
}

function applyPlantScale(p: StrandPoint, cfg: AboutDnaConfig, panY: number): StrandPoint {
  return {
    x: p.x * cfg.scaleXZ,
    y: p.y * cfg.scaleY + panY,
    z: p.z * cfg.scaleXZ,
  }
}

function trackSpine(cfg: AboutDnaConfig, pathPhase: number, radiusScale: number, pathDrift = 0): SpineSample[] {
  let spine = buildSpineSamples(cfg, pathPhase + pathDrift)
  if (radiusScale !== 1) spine = scaleSpineRadii(spine, radiusScale)
  return spine
}

function spineForPhase(cfg: AboutDnaConfig, helixPhase: number): SpineSample[] {
  return buildSpineSamples(cfg, helixPhase * 0.07)
}

function rotateSpineFrame(frame: SpineSample, helixPhase: number): SpineSample {
  if (Math.abs(helixPhase) < 1e-6) return frame
  const n = frame.normal.clone().applyAxisAngle(frame.tangent, helixPhase)
  const b = frame.binormal.clone().applyAxisAngle(frame.tangent, helixPhase)
  return { ...frame, normal: n, binormal: b }
}

type HelixStrandOpts = {
  filamentIndex: number
  filamentCount: number
  helixTurns: number
  phaseOffset: number
  pathPhase: number
  radiusScale: number
  twistGain: number
}

function rebuildHelixStrand(cfg: AboutDnaConfig, opts: HelixStrandOpts, helixPhase: number): StrandPoint[] {
  const spine = trackSpine(cfg, opts.pathPhase, opts.radiusScale, helixPhase * 0.07)
  return sampleHelixFilament(spine, cfg, {
    filamentIndex: opts.filamentIndex,
    filamentCount: opts.filamentCount,
    helixPhase: helixPhase * opts.twistGain,
    helixTurns: opts.helixTurns,
    phaseOffset: opts.phaseOffset,
  })
}

function offsetPoint(
  base: StrandPoint,
  normal: THREE.Vector3,
  binormal: THREE.Vector3,
  tangent: THREE.Vector3,
  alongNormal: number,
  alongBinormal: number,
  alongTangent: number,
): StrandPoint {
  return {
    x: base.x + normal.x * alongNormal + binormal.x * alongBinormal + tangent.x * alongTangent,
    y: base.y + normal.y * alongNormal + binormal.y * alongBinormal + tangent.y * alongTangent,
    z: base.z + normal.z * alongNormal + binormal.z * alongBinormal + tangent.z * alongTangent,
  }
}

function buildLeaf(frame: SpineSample, size: number, tilt: number, outward: number): StrandPoint[] {
  const { center, normal, binormal, tangent } = frame
  const n = normal.clone().multiplyScalar(Math.cos(tilt)).add(tangent.clone().multiplyScalar(Math.sin(tilt) * 0.35))
  const b = binormal.clone()
  const attach = offsetPoint(center, normal, binormal, tangent, outward * 0.35, outward, 0)
  const tip = offsetPoint(attach, n, b, tangent, size * 1.15, 0, size * 0.06)
  const left = offsetPoint(attach, n, b, tangent, size * 0.08, size * 0.5, 0)
  const right = offsetPoint(attach, n, b, tangent, size * 0.08, -size * 0.5, 0)
  return [attach, left, tip, right]
}

function sampleSwirlBranch(
  spine: SpineSample[],
  params: {
    u0: number
    uSpan: number
    steps: number
    branchTurns: number
    side: number
    startAngle: number
    outward: number
    fade0: number
  },
  helixPhase: number,
): StrandPoint[] {
  const { u0, uSpan, steps, branchTurns, side, startAngle, outward } = params
  const points: StrandPoint[] = []
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const u = THREE.MathUtils.clamp(u0 + t * uSpan, 0, 1)
    const frame = spineAtU(spine, u)
    const fade = stalkTopFade(u) * params.fade0
    if (fade < 0.06) continue

    const helixAngle = startAngle + helixPhase + side * branchTurns * Math.PI * 2 * t
    const r = frame.radius * (1.12 + outward * t) + t * 0.14
    const cn = Math.cos(helixAngle)
    const sn = Math.sin(helixAngle)
    points.push({
      x: frame.center.x + frame.normal.x * r * cn + frame.binormal.x * r * sn,
      y: frame.center.y + frame.normal.y * r * cn + frame.binormal.y * r * sn,
      z: frame.center.z + frame.normal.z * r * cn + frame.binormal.z * r * sn,
    })
  }
  return points
}

type CollectPolyline = {
  points: StrandPoint[]
  opacity: number
  strokeWidth: number
  /** Helix, wrappers, artichoke — used for vertical screen fit */
  stalk: boolean
}

function stalkBaseArtichokeFade(u: number, maxU: number): number {
  if (u > maxU) return 0
  return 1 - THREE.MathUtils.smoothstep(maxU * 0.45, maxU, u)
}

function radialOnFrame(frame: SpineSample, angle: number): THREE.Vector3 {
  return frame.normal
    .clone()
    .multiplyScalar(Math.cos(angle))
    .add(frame.binormal.clone().multiplyScalar(Math.sin(angle)))
}

function pointOnBract(
  origin: StrandPoint,
  radial: THREE.Vector3,
  tangent: THREE.Vector3,
  alongRadial: number,
  alongTangent: number,
): StrandPoint {
  return {
    x: origin.x + radial.x * alongRadial + tangent.x * alongTangent,
    y: origin.y + radial.y * alongRadial + tangent.y * alongTangent,
    z: origin.z + radial.z * alongRadial + tangent.z * alongTangent,
  }
}

function offsetBinormal(origin: StrandPoint, binormal: THREE.Vector3, amount: number): StrandPoint {
  return {
    x: origin.x + binormal.x * amount,
    y: origin.y + binormal.y * amount,
    z: origin.z + binormal.z * amount,
  }
}

function pullTowardCup(pt: StrandPoint, radial: THREE.Vector3, amount: number): StrandPoint {
  return {
    x: pt.x - radial.x * amount,
    y: pt.y - radial.y * amount,
    z: pt.z - radial.z * amount,
  }
}

function lerpStrand(a: StrandPoint, b: StrandPoint, t: number): StrandPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }
}

type ArtichokeBractSeed = {
  u: number
  ring: number
  ringCount: number
  index: number
  count: number
  angleJitter: number
  lengthScale: number
  bud?: boolean
}

function buildArtichokeBractPoints(frame: SpineSample, seed: ArtichokeBractSeed, cfg: AboutDnaConfig): StrandPoint[] {
  const { ring, ringCount, angleJitter, lengthScale, bud } = seed
  const open = bud ? 0 : ringCount <= 1 ? 0 : ring / (ringCount - 1)
  const stagger = (ring / Math.max(1, seed.count)) * Math.PI
  const angle = (seed.index / seed.count) * Math.PI * 2 + angleJitter + stagger
  const radial = radialOnFrame(frame, angle)
  const t = frame.tangent
  const b = frame.binormal
  const cup = frame.center
  const scale = cfg.artichokeScale * lengthScale

  const length = frame.radius * (bud ? 0.42 : 0.65 + open * 2.95) * scale
  const lift = frame.radius * (bud ? 0.38 : 0.34 - open * 0.16) * scale
  const baseInset = frame.radius * (bud ? 0.06 : 0.08 + open * 0.1) * scale
  const halfWidth = frame.radius * (bud ? 0.1 : 0.16 + open * 0.34) * scale
  const concave = frame.radius * (bud ? 0.03 : 0.05 + open * 0.07) * scale

  const attach = pointOnBract(cup, radial, t, baseInset, bud ? 0.02 * scale : -0.03 * scale)
  const left = offsetBinormal(attach, b, halfWidth)
  const right = offsetBinormal(attach, b, -halfWidth)
  const tip = pointOnBract(attach, radial, t, length, lift)
  const leftSide = pullTowardCup(lerpStrand(left, tip, 0.58), radial, concave)
  const rightSide = pullTowardCup(lerpStrand(right, tip, 0.58), radial, concave)

  return [left, leftSide, tip, rightSide, right, left]
}

function buildArtichokeBractRib(frame: SpineSample, seed: ArtichokeBractSeed, cfg: AboutDnaConfig): StrandPoint[] {
  const pts = buildArtichokeBractPoints(frame, seed, cfg)
  if (pts.length < 5) return []
  const left = pts[0]
  const tip = pts[2]
  const right = pts[4]
  const baseMid = lerpStrand(left, right, 0.5)
  return [baseMid, tip]
}

class AboutDnaProjector {
  private readonly camX: number
  private readonly camY: number
  private readonly camZ: number
  private readonly lookX: number
  private readonly lookY: number
  private readonly lookZ = 0
  private readonly right: THREE.Vector3
  private readonly up: THREE.Vector3
  private readonly forward: THREE.Vector3
  private readonly tanHalfFov: number
  private readonly aspect: number

  constructor(cfg: AboutDnaConfig, viewW: number, viewH: number) {
    const centerX = getStalkCenterX(cfg)
    const aspect = viewW / viewH
    const extentX =
      (cfg.stalkOffsetX + cfg.snakeSway + getPlantCrossSectionRadius(cfg) * 1.15) * cfg.scaleXZ
    const halfH = Math.min(4.25, getSnakeVerticalHalfExtent(cfg) * 0.21)
    const fovRad = (CAMERA_FOV * Math.PI) / 180
    const halfFov = fovRad / 2
    const distV = halfH / Math.tan(halfFov)
    const halfFovH = Math.atan(Math.tan(halfFov) * aspect)
    const distH = extentX / Math.tan(halfFovH)

    this.aspect = aspect
    this.tanHalfFov = Math.tan(halfFov)
    this.camX = centerX * 0.72
    this.camY = -0.04
    this.camZ = Math.max(distV, distH) * 1.06 + cfg.cameraPadding
    this.lookX = centerX
    this.lookY = CAMERA_LOOK_Y

    this.forward = new THREE.Vector3(this.lookX - this.camX, this.lookY - this.camY, this.lookZ - this.camZ)
    this.forward.normalize()
    this.right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), this.forward).normalize()
    this.up = new THREE.Vector3().crossVectors(this.forward, this.right).normalize()
  }

  project(p: StrandPoint): { x: number; y: number; depth: number } | null {
    const vx = p.x - this.camX
    const vy = p.y - this.camY
    const vz = p.z - this.camZ
    const depth = vx * this.forward.x + vy * this.forward.y + vz * this.forward.z
    if (depth <= 0.05) return null

    const xCam = vx * this.right.x + vy * this.right.y + vz * this.right.z
    const yCam = vx * this.up.x + vy * this.up.y + vz * this.up.z
    const ndcX = xCam / (depth * this.tanHalfFov * this.aspect)
    const ndcY = yCam / (depth * this.tanHalfFov)
    return { x: ndcX, y: ndcY, depth }
  }
}

function pointsToSvgPath(
  points: StrandPoint[],
  cfg: AboutDnaConfig,
  panY: number,
  projector: AboutDnaProjector,
  toScreen: (ndc: { x: number; y: number }) => [number, number],
): { d: string; depth: number } | null {
  const projected: { sx: number; sy: number; depth: number }[] = []
  for (const raw of points) {
    const p = applyPlantScale(raw, cfg, panY)
    const ndc = projector.project(p)
    if (!ndc) continue
    const [sx, sy] = toScreen(ndc)
    projected.push({ sx, sy, depth: ndc.depth })
  }
  if (projected.length < 2) return null
  const d = projected.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.sx.toFixed(2)} ${pt.sy.toFixed(2)}`).join(' ')
  const depth = projected.reduce((s, pt) => s + pt.depth, 0) / projected.length
  return { d, depth }
}

function batWorldScale(cfg: AboutDnaConfig): number {
  return cfg.helixRadius * cfg.scaleXZ * cfg.batScale
}

type BatSeg = [number, number, number, number, number, number]

const BAT_BODY: BatSeg[] = [
  [0, 0.05, 0.02, -0.07, 0.11, -0.02],
  [-0.07, 0.11, -0.02, 0.07, 0.11, -0.02],
  [0.07, 0.11, -0.02, 0, 0.05, 0.02],
  [0, 0.03, 0.08, 0, 0.14, 0.12],
]

function batWingSegs(sx: number): BatSeg[] {
  return [
    [0, 0, 0, sx * 0.48, 0.03, 0.05],
    [sx * 0.48, 0.03, 0.05, sx * 0.64, 0.11, -0.08],
    [sx * 0.64, 0.11, -0.08, sx * 0.34, 0.05, -0.13],
    [sx * 0.34, 0.05, -0.13, 0, 0, 0],
    [sx * 0.48, 0.03, 0.05, sx * 0.28, -0.03, 0.03],
  ]
}

function collectPolylines(
  cfg: AboutDnaConfig,
  helixPhase: number,
  out: CollectPolyline[],
): StalkDotSeed[] {
  const rng = createMulberry32(FOLIAGE_SEED)
  const spine = spineForPhase(cfg, helixPhase)
  const dotSeeds: StalkDotSeed[] = []

  const push = (points: StrandPoint[], opacity: number, strokeWidth: number, stalk = false) => {
    if (points.length >= 2) out.push({ points, opacity, strokeWidth, stalk })
  }

  for (let f = 0; f < cfg.filamentCount; f++) {
    push(
      rebuildHelixStrand(
        cfg,
        {
          filamentIndex: f,
          filamentCount: cfg.filamentCount,
          helixTurns: cfg.helixTurns,
          phaseOffset: f === 0 ? 0 : Math.PI,
          pathPhase: f * 0.16,
          radiusScale: 1,
          twistGain: 1.48,
        },
        helixPhase,
      ),
      cfg.strandOpacity,
      cfg.backboneLineWidth,
      true,
    )
  }

  for (let i = 0; i < cfg.stalkDotCount; i++) {
    const u = 0.03 + rng() * 0.94
    if (stalkTopFade(u) < 0.06) continue
    const frame = spineAtU(buildSpineSamples(cfg), u)
    dotSeeds.push({
      u,
      angle: rng() * Math.PI * 2,
      radial: frame.radius * (0.2 + Math.sqrt(rng()) * 1.02),
    })
  }

  const budRings = 2
  for (let budRing = 0; budRing < budRings; budRing++) {
    const u = 0.002 + budRing * 0.0025
    const fade = stalkBaseArtichokeFade(u, cfg.artichokeMaxU)
    if (fade < 0.05) continue
    const count = 10 + budRing * 4
    const opacity = cfg.artichokeOpacity * fade * (0.92 + budRing * 0.06)
    const width = cfg.artichokeLineWidth * (0.86 + budRing * 0.05)
    for (let i = 0; i < count; i++) {
      const seed: ArtichokeBractSeed = {
        u,
        ring: budRing,
        ringCount: budRings,
        index: i,
        count,
        angleJitter: (rng() - 0.5) * 0.1,
        lengthScale: 0.72 + rng() * 0.22,
        bud: true,
      }
      const frame = rotateSpineFrame(spineAtU(spine, u), helixPhase)
      push(buildArtichokeBractPoints(frame, seed, cfg), opacity, width, true)
      if (rng() < 0.55) {
        push(buildArtichokeBractRib(frame, seed, cfg), opacity * 0.5, width * 0.68, true)
      }
    }
  }

  for (let ring = 0; ring < cfg.artichokeRingCount; ring++) {
    const u = 0.009 + (ring / Math.max(1, cfg.artichokeRingCount - 1)) * cfg.artichokeMaxU * 0.94
    const fade = stalkBaseArtichokeFade(u, cfg.artichokeMaxU)
    if (fade < 0.05) continue
    const count = cfg.artichokeBractsPerRing + ring * cfg.artichokeBractRingStep
    const opacity = cfg.artichokeOpacity * fade * (0.9 + ring * 0.055)
    const width = cfg.artichokeLineWidth * (0.9 + ring * 0.045)
    for (let i = 0; i < count; i++) {
      const seed: ArtichokeBractSeed = {
        u,
        ring,
        ringCount: cfg.artichokeRingCount,
        index: i,
        count,
        angleJitter: (rng() - 0.5) * 0.12,
        lengthScale: 0.9 + rng() * 0.24,
      }
      const frame = rotateSpineFrame(spineAtU(spine, u), helixPhase)
      push(buildArtichokeBractPoints(frame, seed, cfg), opacity, width, true)
      const ribChance = ring < 2 ? 0.45 : 0.82
      if (rng() < ribChance) {
        push(buildArtichokeBractRib(frame, seed, cfg), opacity * 0.58, width * 0.68, true)
      }
    }
  }

  for (let w = 0; w < cfg.wrapperCount; w++) {
    const radiusScale = cfg.wrapperRadiusScales[w] ?? 1.35 + w * 0.34
    const pathPhase = w * 0.42
    const filaments = cfg.wrapperFilaments[w] ?? 3
    const turns = cfg.helixTurns * (cfg.wrapperTurnScales[w] ?? 1 - w * 0.08)
    const phaseOffset = rng() * Math.PI * 2 + w * 1.7
    const width = cfg.wrapperLineWidth * (1 - w * 0.08)
    const opacity = cfg.wrapperOpacity * (1 - w * 0.12)

    for (let f = 0; f < filaments; f++) {
      push(
        rebuildHelixStrand(
          cfg,
          {
            filamentIndex: f,
            filamentCount: filaments,
            helixTurns: turns,
            phaseOffset: phaseOffset + (f / filaments) * Math.PI * 0.5,
            pathPhase,
            radiusScale,
            twistGain: 1.08 + w * 0.04,
          },
          helixPhase,
        ),
        opacity,
        width,
        true,
      )
    }
  }

  for (let b = 0; b < cfg.swirlBranchCount; b++) {
    const u0 = 0.04 + rng() * 0.9
    const fade0 = stalkTopFade(u0)
    if (fade0 < 0.07) continue

    const steps = cfg.swirlBranchSteps
    const branchTurns = cfg.swirlBranchHelixTurns * (0.82 + rng() * 0.38)
    const side = rng() > 0.5 ? 1 : -1
    const startAngle = rng() * Math.PI * 2
    const uSpan = 0.035 + rng() * 0.14
    const outward = 0.12 + rng() * 0.42
    const swirlParams = { u0, uSpan, steps, branchTurns, side, startAngle, outward, fade0 }
    push(sampleSwirlBranch(spine, swirlParams, helixPhase), cfg.swirlBranchOpacity * fade0, cfg.swirlBranchLineWidth)

    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const u = THREE.MathUtils.clamp(u0 + t * uSpan, 0, 1)
      const fade = stalkTopFade(u) * fade0
      if (fade < 0.06) continue
      if (s > 1 && s % 3 === 1 && rng() > 0.22) {
        const helixAngle = startAngle + helixPhase + side * branchTurns * Math.PI * 2 * t
        const frame = spineAtU(spine, u)
        const r = frame.radius * (1.12 + outward * t) + t * 0.14
        const cn = Math.cos(helixAngle)
        const sn = Math.sin(helixAngle)
        const pt: StrandPoint = {
          x: frame.center.x + frame.normal.x * r * cn + frame.binormal.x * r * sn,
          y: frame.center.y + frame.normal.y * r * cn + frame.binormal.y * r * sn,
          z: frame.center.z + frame.normal.z * r * cn + frame.binormal.z * r * sn,
        }
        const size = cfg.leafSize * (0.38 + rng() * 0.42) * fade
        const leafTilt = (rng() - 0.5) * 1.05
        push(buildLeaf({ ...frame, center: pt }, size, leafTilt, 0.02), cfg.leafOpacity * fade * 0.78, cfg.leafLineWidth * 0.64)
      }
    }
  }

  const usedU: number[] = []
  for (let i = 0; i < cfg.leafCount; i++) {
    let u = 0.1 + rng() * 0.82
    for (let tryN = 0; tryN < 8; tryN++) {
      if (!usedU.some((prev) => Math.abs(prev - u) < 0.045)) break
      u = 0.1 + rng() * 0.82
    }
    usedU.push(u)
    const fade = stalkTopFade(u)
    if (fade < 0.08) continue
    const frame = rotateSpineFrame(spineAtU(spine, u), helixPhase)
    const size = cfg.leafSize * (0.75 + rng() * 0.55) * fade
    const tilt = (rng() - 0.5) * 0.9
    const outward = (rng() - 0.5) * frame.radius * 0.55
    push(buildLeaf(frame, size, tilt, outward), cfg.leafOpacity * fade, cfg.leafLineWidth)
  }

  for (let i = 0; i < cfg.branchCount; i++) {
    const u = 0.06 + rng() * 0.9
    const fade = stalkTopFade(u)
    if (fade < 0.1) continue

    const frame = rotateSpineFrame(spineAtU(spine, u), helixPhase)
    const side = rng() > 0.5 ? 1 : -1
    const pitch = 0.35 + rng() * 0.55
    const yaw = (rng() - 0.5) * 0.8
    const tilt = (rng() - 0.5) * 0.9
    const dir = frame.normal
      .clone()
      .multiplyScalar(Math.cos(pitch))
      .add(frame.binormal.clone().multiplyScalar(side * Math.sin(pitch)))
      .add(frame.tangent.clone().multiplyScalar(yaw * 0.25))
      .normalize()
    const length = cfg.branchLength * (0.7 + rng() * 0.65) * fade
    const start = offsetPoint(frame.center, frame.normal, frame.binormal, frame.tangent, frame.radius * 1.1, 0, 0)
    const mid = {
      x: start.x + dir.x * length * 0.55,
      y: start.y + dir.y * length * 0.55,
      z: start.z + dir.z * length * 0.55,
    }
    const end = {
      x: start.x + dir.x * length,
      y: start.y + dir.y * length,
      z: start.z + dir.z * length,
    }
    push([start, mid, end], cfg.branchOpacity * fade, cfg.branchLineWidth)
    if (rng() > 0.4) {
      const twigLen = length * 0.45
      const twigDir = frame.binormal.clone().multiplyScalar(side).add(frame.tangent.clone().multiplyScalar(0.35))
      const twigEnd = {
        x: mid.x + twigDir.x * twigLen,
        y: mid.y + twigDir.y * twigLen,
        z: mid.z + twigDir.z * twigLen,
      }
      push([mid, twigEnd], cfg.branchOpacity * fade * 0.9, cfg.branchLineWidth * 0.85)
      if (rng() > 0.35) {
        push(buildLeaf({ ...frame, center: end }, cfg.leafSize * 0.55 * fade, tilt, 0.02), cfg.leafOpacity * fade * 0.85, cfg.leafLineWidth * 0.7)
      }
    } else if (rng() > 0.35) {
      push(buildLeaf({ ...frame, center: end }, cfg.leafSize * 0.62 * fade, tilt, 0.02), cfg.leafOpacity * fade, cfg.leafLineWidth)
    }
  }

  return dotSeeds
}

type StalkDotSeed = { u: number; angle: number; radial: number }

/** Include spine base + outer wrapper radius so the artichoke base reaches the view bottom. */
function trackStalkBaseExtents(
  cfg: AboutDnaConfig,
  helixPhase: number,
  panY: number,
  projector: AboutDnaProjector,
  track: (ndc: { x: number; y: number }) => void,
) {
  const spine = spineForPhase(cfg, helixPhase)
  const outerScale = cfg.wrapperRadiusScales[cfg.wrapperCount - 1] ?? 2.38
  const outerR = cfg.helixRadius * outerScale
  const twist = helixPhase * 1.48

  for (const s of spine) {
    const isBase = s.u <= cfg.artichokeMaxU + 0.1
    const isTop = s.u >= 0.94
    if (!isBase && !isTop) continue
    const center = applyPlantScale(s.center, cfg, panY)
    const ndcCenter = projector.project(center)
    if (ndcCenter) track(ndcCenter)

    for (let k = 0; k < 12; k++) {
      const angle = s.arcS * cfg.helixTurns * Math.PI * 2 + (k / 12) * Math.PI * 2 + twist
      const cn = Math.cos(angle)
      const sn = Math.sin(angle)
      const p = applyPlantScale(
        {
          x: s.center.x + outerR * (cn * s.normal.x + sn * s.binormal.x),
          y: s.center.y + outerR * (cn * s.normal.y + sn * s.binormal.y),
          z: s.center.z + outerR * (cn * s.normal.z + sn * s.binormal.z),
        },
        cfg,
        panY,
      )
      const ndc = projector.project(p)
      if (ndc) track(ndc)
    }
  }
}

function stalkDotWorld(seed: StalkDotSeed, cfg: AboutDnaConfig, helixPhase: number): StrandPoint {
  const frame = spineAtU(spineForPhase(cfg, helixPhase), seed.u)
  const helixAngle = seed.angle + helixPhase
  const cn = Math.cos(helixAngle)
  const sn = Math.sin(helixAngle)
  return {
    x: frame.center.x + frame.normal.x * seed.radial * cn + frame.binormal.x * seed.radial * sn,
    y: frame.center.y + frame.normal.y * seed.radial * cn + frame.binormal.y * seed.radial * sn,
    z: frame.center.z + frame.normal.z * seed.radial * cn + frame.binormal.z * seed.radial * sn,
  }
}

function batSegmentToWorld(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  root: THREE.Object3D,
): [StrandPoint, StrandPoint] {
  const a = new THREE.Vector3(ax, ay, az)
  const b = new THREE.Vector3(bx, by, bz)
  a.applyMatrix4(root.matrixWorld)
  b.applyMatrix4(root.matrixWorld)
  return [
    { x: a.x, y: a.y, z: a.z },
    { x: b.x, y: b.y, z: b.z },
  ]
}

function buildBatPaths(
  cfg: AboutDnaConfig,
  panY: number,
  perch: THREE.Vector3,
  yaw: number,
  wingPhase: number,
  projector: AboutDnaProjector,
  toScreen: (ndc: { x: number; y: number }) => [number, number],
): { paths: string[]; depth: number } | null {
  const scale = batWorldScale(cfg)
  const root = new THREE.Group()
  root.position.set(perch.x * cfg.scaleXZ, perch.y * cfg.scaleY + panY, perch.z * cfg.scaleXZ)
  root.rotation.order = 'YXZ'
  root.rotation.y = yaw
  root.rotation.x = Math.PI

  const body = new THREE.Group()
  const wingL = new THREE.Group()
  const wingR = new THREE.Group()
  wingL.position.set(-0.06, 0.02, 0)
  wingR.position.set(0.06, 0.02, 0)
  const fold = 0.35 + Math.sin(wingPhase) * 0.08
  wingL.rotation.z = fold
  wingR.rotation.z = -fold
  body.rotation.x = 0.12
  body.add(wingL, wingR)
  root.add(body)
  root.scale.setScalar(scale)
  root.updateMatrixWorld(true)

  const segments: [StrandPoint, StrandPoint][] = []
  for (const [ax, ay, az, bx, by, bz] of BAT_BODY) {
    segments.push(batSegmentToWorld(ax, ay, az, bx, by, bz, body))
  }
  for (const seg of batWingSegs(-1)) {
    segments.push(batSegmentToWorld(seg[0], seg[1], seg[2], seg[3], seg[4], seg[5], wingL))
  }
  for (const seg of batWingSegs(1)) {
    segments.push(batSegmentToWorld(seg[0], seg[1], seg[2], seg[3], seg[4], seg[5], wingR))
  }

  const paths: string[] = []
  let depthSum = 0
  let depthCount = 0
  for (const [a, b] of segments) {
    const pa = projector.project(a)
    const pb = projector.project(b)
    if (!pa || !pb) continue
    const [ax, ay] = toScreen(pa)
    const [bx, by] = toScreen(pb)
    paths.push(`M ${ax.toFixed(2)} ${ay.toFixed(2)} L ${bx.toFixed(2)} ${by.toFixed(2)}`)
    depthSum += pa.depth + pb.depth
    depthCount += 2
  }
  if (paths.length === 0) return null
  return { paths, depth: depthSum / depthCount }
}

function measureStalkScreenSpan(
  polylinesRaw: CollectPolyline[],
  dotSeeds: StalkDotSeed[],
  cfg: AboutDnaConfig,
  helixPhase: number,
  panY: number,
  projector: AboutDnaProjector,
  toScreen: (ndc: { x: number; y: number }) => [number, number],
): { minCy: number; maxCy: number } {
  let minCy = Infinity
  let maxCy = -Infinity

  const sample = (ndc: { x: number; y: number }) => {
    const [, y] = toScreen(ndc)
    minCy = Math.min(minCy, y)
    maxCy = Math.max(maxCy, y)
  }

  for (const line of polylinesRaw) {
    if (!line.stalk) continue
    for (const raw of line.points) {
      const ndc = projector.project(applyPlantScale(raw, cfg, panY))
      if (ndc) sample(ndc)
    }
  }
  for (const seed of dotSeeds) {
    const ndc = projector.project(applyPlantScale(stalkDotWorld(seed, cfg, helixPhase), cfg, panY))
    if (ndc) sample(ndc)
  }
  trackStalkBaseExtents(cfg, helixPhase, panY, projector, sample)

  return { minCy, maxCy }
}

export function buildAboutVineStaticScene(
  cfg: AboutDnaConfig,
  helixPhase: number,
  panY: number,
  pinViewport = false,
): AboutVineStaticScene {
  const polylinesRaw: CollectPolyline[] = []
  const dotSeeds = collectPolylines(cfg, helixPhase, polylinesRaw)

  const batRng = createMulberry32(BAT_SEED)
  const spine = buildSpineSamples(cfg)
  const perches = buildVineBatPerches(cfg, batRng, spine)
  const totalBats = Math.min(cfg.batCount + cfg.flyingBatCount, perches.length)
  const usedPerches = new Set<number>()
  const batSeeds: { perchIndex: number; wingPhase: number }[] = []
  for (let i = 0; i < totalBats; i++) {
    let idx = Math.floor(batRng() * perches.length)
    for (let guard = 0; guard < 24 && usedPerches.has(idx); guard++) idx = Math.floor(batRng() * perches.length)
    usedPerches.add(idx)
    batSeeds.push({ perchIndex: idx, wingPhase: batRng() * Math.PI * 2 })
  }

  const projector = new AboutDnaProjector(cfg, VIEW_W, VIEW_H)
  let minX = Infinity
  let maxX = -Infinity
  let minYStalk = Infinity
  let maxYStalk = -Infinity

  const trackNdc = (ndc: { x: number; y: number }, stalk: boolean) => {
    minX = Math.min(minX, ndc.x)
    maxX = Math.max(maxX, ndc.x)
    if (stalk) {
      minYStalk = Math.min(minYStalk, ndc.y)
      maxYStalk = Math.max(maxYStalk, ndc.y)
    }
  }

  for (const line of polylinesRaw) {
    for (const raw of line.points) {
      const ndc = projector.project(applyPlantScale(raw, cfg, panY))
      if (ndc) trackNdc(ndc, line.stalk)
    }
  }
  for (const seed of dotSeeds) {
    const ndc = projector.project(applyPlantScale(stalkDotWorld(seed, cfg, helixPhase), cfg, panY))
    if (ndc) trackNdc(ndc, true)
  }
  for (const bat of batSeeds) {
    const p = perches[bat.perchIndex]
    if (!p) continue
    const world = applyPlantScale({ x: p.position.x, y: p.position.y, z: p.position.z }, cfg, panY)
    const ndc = projector.project(world)
    if (ndc) trackNdc(ndc, false)
  }

  trackStalkBaseExtents(cfg, helixPhase, panY, projector, (ndc) => trackNdc(ndc, true))

  const padNdcX = 0.08
  const padTopNdcY = 0.04
  minX -= padNdcX
  maxX += padNdcX
  maxYStalk += padTopNdcY
  const rangeX = Math.max(0.12, maxX - minX)
  const rangeY = Math.max(0.12, maxYStalk - minYStalk)

  const toScreenBase = (ndc: { x: number; y: number }): [number, number] => [
    ((ndc.x - minX) / rangeX) * VIEW_W,
    ((maxYStalk - ndc.y) / rangeY) * VIEW_H,
  ]

  let toScreen = toScreenBase
  if (pinViewport && Number.isFinite(minYStalk)) {
    const { minCy, maxCy } = measureStalkScreenSpan(
      polylinesRaw,
      dotSeeds,
      cfg,
      helixPhase,
      panY,
      projector,
      toScreenBase,
    )
    const span = Math.max(1e-3, maxCy - minCy)
    toScreen = (ndc) => {
      const [x, y] = toScreenBase(ndc)
      return [x, ((y - minCy) / span) * VIEW_H]
    }
  }

  const polylines: StaticVinePath[] = []
  for (const line of polylinesRaw) {
    const path = pointsToSvgPath(line.points, cfg, panY, projector, toScreen)
    if (!path) continue
    polylines.push({
      d: path.d,
      depth: path.depth,
      opacity: line.opacity,
      strokeWidth: line.strokeWidth * 1.15,
    })
  }

  const dots: StaticVineDot[] = []
  for (const seed of dotSeeds) {
    const world = applyPlantScale(stalkDotWorld(seed, cfg, helixPhase), cfg, panY)
    const ndc = projector.project(world)
    if (!ndc) continue
    const [cx, cy] = toScreen(ndc)
    dots.push({
      cx,
      cy,
      r: cfg.stalkDotSize * 0.42,
      opacity: cfg.stalkDotOpacity,
      depth: ndc.depth,
    })
  }

  const bats: StaticVineBat[] = []
  for (const bat of batSeeds) {
    const perch = perches[bat.perchIndex]
    if (!perch) continue
    const built = buildBatPaths(cfg, panY, perch.position, perch.yaw, bat.wingPhase, projector, toScreen)
    if (!built) continue
    bats.push({
      paths: built.paths,
      depth: built.depth,
      opacity: cfg.batLineOpacity,
    })
  }

  polylines.sort((a, b) => b.depth - a.depth)
  dots.sort((a, b) => b.depth - a.depth)
  bats.sort((a, b) => b.depth - a.depth)

  return {
    viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
    polylines,
    dots,
    bats,
  }
}
