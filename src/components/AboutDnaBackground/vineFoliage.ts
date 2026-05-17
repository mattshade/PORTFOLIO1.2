import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { createLineBatch, flushLineBatch } from '../OrigamiAviaryBackground/lineBatch'
import type { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'
import type { AboutDnaConfig } from './dnaConfig'
import {
  buildSpineSamples,
  sampleHelixFilament,
  scaleSpineRadii,
  spineAtU,
  stalkTopFade,
  type SpineSample,
  type StrandPoint,
} from './spinePath'

type Rng = ReturnType<typeof createMulberry32>

const stalkDotVertex = /* glsl */ `
  attribute float aSize;
  uniform float uPixelRatio;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(1.0, aSize * uPixelRatio * (44.0 / max(1.0, -mv.z)));
    gl_Position = projectionMatrix * mv;
  }
`

const stalkDotFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.28, d) * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`

type AnimPolyline = {
  line: Line2
  rebuild: (spine: SpineSample[], helixPhase: number) => StrandPoint[]
}

function rotateSpineFrame(frame: SpineSample, helixPhase: number): SpineSample {
  if (Math.abs(helixPhase) < 1e-6) return frame
  const n = frame.normal.clone().applyAxisAngle(frame.tangent, helixPhase)
  const b = frame.binormal.clone().applyAxisAngle(frame.tangent, helixPhase)
  return { ...frame, normal: n, binormal: b }
}

function spineForPhase(cfg: AboutDnaConfig, helixPhase: number): SpineSample[] {
  return buildSpineSamples(cfg, helixPhase * 0.07)
}

function pushAnimPolyline(
  points: StrandPoint[],
  rebuild: (spine: SpineSample[], helixPhase: number) => StrandPoint[],
  parent: THREE.Object3D,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  color: THREE.Color,
  opacity: number,
  width: number,
) {
  if (points.length < 2) return
  const line = flushPolyline(points, parent, roots, color, opacity, width)
  if (!line) return
  animPolylines.push({ line, rebuild })
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

function registerHelixStrand(
  group: THREE.Object3D,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  cfg: AboutDnaConfig,
  opts: HelixStrandOpts,
  color: THREE.Color,
  opacity: number,
  width: number,
) {
  const strandOpts = opts
  const initial = rebuildHelixStrand(cfg, strandOpts, 0)
  pushAnimPolyline(
    initial,
    (_spine, phase) => rebuildHelixStrand(cfg, strandOpts, phase),
    group,
    roots,
    animPolylines,
    color,
    opacity,
    width,
  )
}

function refreshLineOpacity(line: Line2) {
  const mat = line.material as LineMaterial
  const base = mat.userData.baseOpacity
  if (typeof base === 'number') mat.opacity = base
}

function updateAnimPolylines(animPolylines: AnimPolyline[], cfg: AboutDnaConfig, helixPhase: number) {
  const spine = spineForPhase(cfg, helixPhase)
  for (const anim of animPolylines) {
    const points = anim.rebuild(spine, helixPhase)
    const positions = pointsToLinePositions(points)
    if (positions.length < 6) continue
    anim.line.geometry.setPositions(positions)
    anim.line.geometry.computeBoundingSphere()
    anim.line.computeLineDistances()
    refreshLineOpacity(anim.line)
  }
}

function trackSpine(cfg: AboutDnaConfig, pathPhase: number, radiusScale: number, pathDrift = 0): SpineSample[] {
  let spine = buildSpineSamples(cfg, pathPhase + pathDrift)
  if (radiusScale !== 1) spine = scaleSpineRadii(spine, radiusScale)
  return spine
}

type StalkDotSeed = { u: number; angle: number; radial: number }

export type AboutVinePlant = {
  group: THREE.Group
  cfg: AboutDnaConfig
  stalkDots: THREE.Points | null
  stalkDotSeeds: StalkDotSeed[]
  updatePhase: (helixPhase: number) => void
}

function pointsToLinePositions(points: StrandPoint[]): number[] {
  const positions: number[] = []
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }
  return positions
}

function flushPolyline(
  points: StrandPoint[],
  parent: THREE.Object3D,
  roots: THREE.Object3D[],
  color: THREE.Color,
  opacity: number,
  width: number,
): Line2 | null {
  if (points.length < 2) return null
  const batch = createLineBatch(opacity, width)
  batch.positions.push(...pointsToLinePositions(points))
  return flushLineBatch(batch, parent, color, roots, 12, width, {
    fog: false,
    depthFade: 0,
    alphaToCoverage: false,
  })
}

function buildWrapperVines(
  group: THREE.Object3D,
  _baseSpine: SpineSample[],
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  bright: THREE.Color,
  muted: THREE.Color,
  rng: Rng,
) {
  const layer = new THREE.Group()
  layer.name = 'about-vine-wrappers'
  group.add(layer)

  for (let w = 0; w < cfg.wrapperCount; w++) {
    const radiusScale = cfg.wrapperRadiusScales[w] ?? 1.35 + w * 0.34
    const pathPhase = w * 0.42
    const filaments = cfg.wrapperFilaments[w] ?? 3
    const turns = cfg.helixTurns * (cfg.wrapperTurnScales[w] ?? 1 - w * 0.08)
    const phaseOffset = rng() * Math.PI * 2 + w * 1.7
    const color = muted.clone().lerp(bright, 0.25 + w * 0.12)
    const width = cfg.wrapperLineWidth * (1 - w * 0.08)
    const opacity = cfg.wrapperOpacity * (1 - w * 0.12)

    for (let f = 0; f < filaments; f++) {
      registerHelixStrand(
        layer,
        roots,
        animPolylines,
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
        color,
        opacity,
        width,
      )
    }
  }
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

type ArtichokeBractSeed = {
  u: number
  ring: number
  ringCount: number
  index: number
  count: number
  angleJitter: number
  lengthScale: number
  /** Tight upright petals in the closed center bud */
  bud?: boolean
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

/** Spade-shaped petal — wide base, concave sides, sharp tip (open artichoke flower). */
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

/** Center vein on each petal. */
function buildArtichokeBractRib(
  frame: SpineSample,
  seed: ArtichokeBractSeed,
  cfg: AboutDnaConfig,
): StrandPoint[] {
  const pts = buildArtichokeBractPoints(frame, seed, cfg)
  if (pts.length < 5) return []
  const left = pts[0]
  const tip = pts[2]
  const right = pts[4]
  const baseMid = lerpStrand(left, right, 0.5)
  return [baseMid, tip]
}

/** Vertical striation on the petal face (reference artichoke ridges). */
function buildArtichokeBractStria(
  frame: SpineSample,
  seed: ArtichokeBractSeed,
  cfg: AboutDnaConfig,
  stripe: number,
): StrandPoint[] {
  const pts = buildArtichokeBractPoints(frame, seed, cfg)
  if (pts.length < 5) return []
  const left = pts[0]
  const leftSide = pts[1]
  const tip = pts[2]
  const rightSide = pts[3]
  const right = pts[4]
  const along = stripe === 0 ? 0.34 : 0.66
  const base = lerpStrand(left, right, along)
  const edge = along < 0.5 ? lerpStrand(left, leftSide, 0.62) : lerpStrand(right, rightSide, 0.62)
  const top = lerpStrand(edge, tip, 0.78)
  return [base, top]
}

function pushArtichokeBract(
  layer: THREE.Group,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  cfg: AboutDnaConfig,
  seed: ArtichokeBractSeed,
  bractColor: THREE.Color,
  ribColor: THREE.Color,
  opacity: number,
  width: number,
  rng: Rng,
) {
  const spineU = seed.u
  const bractSeed = seed
  const initialFrame = spineAtU(buildSpineSamples(cfg), spineU)
  const initial = buildArtichokeBractPoints(initialFrame, bractSeed, cfg)

  pushAnimPolyline(
    initial,
    (s, phase) => {
      const f = rotateSpineFrame(spineAtU(s, spineU), phase)
      return buildArtichokeBractPoints(f, bractSeed, cfg)
    },
    layer,
    roots,
    animPolylines,
    bractColor,
    opacity,
    width,
  )

  const ribChance = seed.bud ? 0.55 : seed.ring < 2 ? 0.45 : 0.82
  if (rng() < ribChance) {
    const rib = buildArtichokeBractRib(initialFrame, bractSeed, cfg)
    pushAnimPolyline(
      rib,
      (s, phase) => {
        const f = rotateSpineFrame(spineAtU(s, spineU), phase)
        return buildArtichokeBractRib(f, bractSeed, cfg)
      },
      layer,
      roots,
      animPolylines,
      ribColor,
      opacity * (seed.bud ? 0.5 : 0.58),
      width * 0.68,
    )
  }

  if (!seed.bud && seed.ring >= 1 && rng() > 0.22) {
    for (let stripe = 0; stripe < 2; stripe++) {
      if (rng() > 0.38) continue
      const stria = buildArtichokeBractStria(initialFrame, bractSeed, cfg, stripe)
      const stripeIdx = stripe
      pushAnimPolyline(
        stria,
        (s, phase) => {
          const f = rotateSpineFrame(spineAtU(s, spineU), phase)
          return buildArtichokeBractStria(f, bractSeed, cfg, stripeIdx)
        },
        layer,
        roots,
        animPolylines,
        ribColor,
        opacity * 0.38,
        width * 0.55,
      )
    }
  }
}

function buildArtichokeBase(
  group: THREE.Object3D,
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  bractColor: THREE.Color,
  ribColor: THREE.Color,
  rng: Rng,
) {
  const layer = new THREE.Group()
  layer.name = 'about-vine-artichoke-base'
  group.add(layer)

  const ringCount = cfg.artichokeRingCount
  const baseBracts = cfg.artichokeBractsPerRing

  const budRings = 2
  for (let budRing = 0; budRing < budRings; budRing++) {
    const u = 0.002 + budRing * 0.0025
    const fade = stalkBaseArtichokeFade(u, cfg.artichokeMaxU)
    if (fade < 0.05) continue

    const count = 10 + budRing * 4
    const opacity = cfg.artichokeOpacity * fade * (0.92 + budRing * 0.06)
    const width = cfg.artichokeLineWidth * (0.86 + budRing * 0.05)

    for (let i = 0; i < count; i++) {
      pushArtichokeBract(
        layer,
        roots,
        animPolylines,
        cfg,
        {
          u,
          ring: budRing,
          ringCount: budRings,
          index: i,
          count,
          angleJitter: (rng() - 0.5) * 0.1,
          lengthScale: 0.72 + rng() * 0.22,
          bud: true,
        },
        bractColor,
        ribColor,
        opacity,
        width,
        rng,
      )
    }
  }

  for (let ring = 0; ring < ringCount; ring++) {
    const u = 0.009 + (ring / Math.max(1, ringCount - 1)) * cfg.artichokeMaxU * 0.94
    const fade = stalkBaseArtichokeFade(u, cfg.artichokeMaxU)
    if (fade < 0.05) continue

    const count = baseBracts + ring * cfg.artichokeBractRingStep
    const opacity = cfg.artichokeOpacity * fade * (0.9 + ring * 0.055)
    const width = cfg.artichokeLineWidth * (0.9 + ring * 0.045)

    for (let i = 0; i < count; i++) {
      pushArtichokeBract(
        layer,
        roots,
        animPolylines,
        cfg,
        {
          u,
          ring,
          ringCount,
          index: i,
          count,
          angleJitter: (rng() - 0.5) * 0.12,
          lengthScale: 0.9 + rng() * 0.24,
        },
        bractColor,
        ribColor,
        opacity,
        width,
        rng,
      )
    }
  }
}

/** Open 3-line leaf — avoids closed diamond shapes that read as squares. */
function buildLeaf(
  frame: SpineSample,
  size: number,
  tilt: number,
  outward: number,
): StrandPoint[] {
  const { center, normal, binormal, tangent } = frame
  const n = normal.clone().multiplyScalar(Math.cos(tilt)).add(tangent.clone().multiplyScalar(Math.sin(tilt) * 0.35))
  const b = binormal.clone()
  const attach = offsetPoint(center, normal, binormal, tangent, outward * 0.35, outward, 0)
  const tip = offsetPoint(attach, n, b, tangent, size * 1.15, 0, size * 0.06)
  const left = offsetPoint(attach, n, b, tangent, size * 0.08, size * 0.5, 0)
  const right = offsetPoint(attach, n, b, tangent, size * 0.08, -size * 0.5, 0)
  return [attach, left, tip, right]
}

function buildLeaves(
  group: THREE.Object3D,
  spine: SpineSample[],
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  leafColor: THREE.Color,
  rng: Rng,
) {
  const layer = new THREE.Group()
  layer.name = 'about-vine-leaves'
  group.add(layer)

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

    const frame = spineAtU(spine, u)
    const size = cfg.leafSize * (0.75 + rng() * 0.55) * fade
    const tilt = (rng() - 0.5) * 0.9
    const outward = frame.radius * (1.05 + rng() * 0.35)
    const outline = buildLeaf(frame, size, tilt, outward)
    const opacity = cfg.leafOpacity * fade
    const width = cfg.leafLineWidth
    const leafU = u
    const leafSize = size
    const leafTilt = tilt
    const leafOutward = outward

    pushAnimPolyline(
      outline,
      (s, phase) => {
        const f = rotateSpineFrame(spineAtU(s, leafU), phase)
        return buildLeaf(f, leafSize, leafTilt, leafOutward)
      },
      layer,
      roots,
      animPolylines,
      leafColor,
      opacity,
      width,
    )
  }
}

function buildBranchWithLeaves(
  group: THREE.Object3D,
  spine: SpineSample[],
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  branchColor: THREE.Color,
  leafColor: THREE.Color,
  rng: Rng,
) {
  const u = 0.06 + rng() * 0.9
  const fade = stalkTopFade(u)
  if (fade < 0.1) return

  const frame = spineAtU(spine, u)
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

  const branchU = u
  const branchFade = fade
  const branchSide = side
  const branchPitch = pitch
  const branchYaw = yaw
  const branchTilt = tilt
  const branchLength = length
  const branchOpacity = cfg.branchOpacity * fade
  const branchWidth = cfg.branchLineWidth
  const doTwig = rng() > 0.4
  const twigLeafRoll = rng()
  const endLeafRoll = rng()

  const rebuildBranch = (s: SpineSample[], phase: number): StrandPoint[] => {
    const f = rotateSpineFrame(spineAtU(s, branchU), phase)
    const dir = f.normal
      .clone()
      .multiplyScalar(Math.cos(branchPitch))
      .add(f.binormal.clone().multiplyScalar(branchSide * Math.sin(branchPitch)))
      .add(f.tangent.clone().multiplyScalar(branchYaw * 0.25))
      .normalize()
    const len = branchLength
    const st = offsetPoint(f.center, f.normal, f.binormal, f.tangent, f.radius * 1.1, 0, 0)
    const md = {
      x: st.x + dir.x * len * 0.55,
      y: st.y + dir.y * len * 0.55,
      z: st.z + dir.z * len * 0.55,
    }
    const en = { x: st.x + dir.x * len, y: st.y + dir.y * len, z: st.z + dir.z * len }
    return [st, md, en]
  }

  pushAnimPolyline(
    [start, mid, end],
    rebuildBranch,
    group,
    roots,
    animPolylines,
    branchColor,
    branchOpacity,
    branchWidth,
  )

  if (doTwig) {
    const twigLen = branchLength * 0.45
    pushAnimPolyline(
      [mid, end],
      (s, phase) => {
        const pts = rebuildBranch(s, phase)
        const md = pts[1]
        const f = rotateSpineFrame(spineAtU(s, branchU), phase)
        const twigDir = f.binormal.clone().multiplyScalar(branchSide).add(f.tangent.clone().multiplyScalar(0.35))
        const twigEnd = {
          x: md.x + twigDir.x * twigLen,
          y: md.y + twigDir.y * twigLen,
          z: md.z + twigDir.z * twigLen,
        }
        return [md, twigEnd]
      },
      group,
      roots,
      animPolylines,
      branchColor,
      branchOpacity * 0.9,
      branchWidth * 0.85,
    )
    if (twigLeafRoll > 0.35) {
      const small = cfg.leafSize * 0.55 * branchFade
      pushAnimPolyline(
        buildLeaf({ ...frame, center: end }, small, branchTilt, 0.02),
        (s, phase) => {
          const pts = rebuildBranch(s, phase)
          const md = pts[1]
          const f = rotateSpineFrame(spineAtU(s, branchU), phase)
          const twigDir = f.binormal.clone().multiplyScalar(branchSide).add(f.tangent.clone().multiplyScalar(0.35))
          const twigEnd = {
            x: md.x + twigDir.x * twigLen,
            y: md.y + twigDir.y * twigLen,
            z: md.z + twigDir.z * twigLen,
          }
          return buildLeaf({ ...f, center: twigEnd }, small, branchTilt, 0.02)
        },
        group,
        roots,
        animPolylines,
        leafColor,
        cfg.leafOpacity * branchFade * 0.8,
        cfg.leafLineWidth * 0.8,
      )
    }
  }

  if (endLeafRoll > 0.25) {
    const endLeafSize = cfg.leafSize * 0.65 * branchFade
    const endLeafTilt = (rng() - 0.5) * 0.6
    pushAnimPolyline(
      buildLeaf({ ...frame, center: end }, endLeafSize, endLeafTilt, 0.04),
      (s, phase) => {
        const pts = rebuildBranch(s, phase)
        const en = pts[2]
        const f = rotateSpineFrame(spineAtU(s, branchU), phase)
        return buildLeaf({ ...f, center: en }, endLeafSize, endLeafTilt, 0.04)
      },
      group,
      roots,
      animPolylines,
      leafColor,
      cfg.leafOpacity * branchFade * 0.85,
      cfg.leafLineWidth * 0.85,
    )
  }
}

function buildBranches(
  group: THREE.Object3D,
  spine: SpineSample[],
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  branchColor: THREE.Color,
  leafColor: THREE.Color,
  rng: Rng,
) {
  const layer = new THREE.Group()
  layer.name = 'about-vine-branches'
  group.add(layer)

  for (let i = 0; i < cfg.branchCount; i++) {
    buildBranchWithLeaves(layer, spine, cfg, roots, animPolylines, branchColor, leafColor, rng)
  }
}

function placeStalkDot(
  frame: SpineSample,
  angle: number,
  radial: number,
  helixPhase: number,
  out: Float32Array,
  i3: number,
) {
  const helixAngle = angle + helixPhase
  const cn = Math.cos(helixAngle)
  const sn = Math.sin(helixAngle)
  out[i3] = frame.center.x + frame.normal.x * radial * cn + frame.binormal.x * radial * sn
  out[i3 + 1] = frame.center.y + frame.normal.y * radial * cn + frame.binormal.y * radial * sn
  out[i3 + 2] = frame.center.z + frame.normal.z * radial * cn + frame.binormal.z * radial * sn
}

function updateStalkDots(
  points: THREE.Points,
  seeds: StalkDotSeed[],
  cfg: AboutDnaConfig,
  helixPhase: number,
) {
  const spine = spineForPhase(cfg, helixPhase)
  const posAttr = points.geometry.getAttribute('position') as THREE.BufferAttribute
  const positions = posAttr.array as Float32Array

  for (let i = 0; i < seeds.length; i++) {
    const { u, angle, radial } = seeds[i]
    const frame = spineAtU(spine, u)
    placeStalkDot(frame, angle, radial, helixPhase, positions, i * 3)
  }
  posAttr.needsUpdate = true
  points.geometry.computeBoundingSphere()
}

function buildStalkDots(
  group: THREE.Object3D,
  spine: SpineSample[],
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  color: THREE.Color,
  rng: Rng,
): { points: THREE.Points; seeds: StalkDotSeed[] } | null {
  if (cfg.stalkDotCount <= 0) return null

  const layer = new THREE.Group()
  layer.name = 'about-vine-dots'
  group.add(layer)

  const count = cfg.stalkDotCount
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const seeds: StalkDotSeed[] = []
  let written = 0

  for (let i = 0; i < count; i++) {
    const u = 0.03 + rng() * 0.94
    if (stalkTopFade(u) < 0.06) continue

    const frame = spineAtU(spine, u)
    const angle = rng() * Math.PI * 2
    const radial = frame.radius * (0.2 + Math.sqrt(rng()) * 1.02)
    seeds.push({ u, angle, radial })
    placeStalkDot(frame, angle, radial, 0, positions, written * 3)
    sizes[written] = cfg.stalkDotSize * (0.72 + rng() * 0.38)
    written++
  }

  if (written < 4) return null

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions.subarray(0, written * 3), 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes.subarray(0, written), 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uOpacity: { value: cfg.stalkDotOpacity },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
    },
    vertexShader: stalkDotVertex,
    fragmentShader: stalkDotFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })

  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  points.name = 'about-vine-dots-points'
  layer.add(points)
  roots.push(points)
  return { points, seeds }
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
  const { u0, uSpan, steps, branchTurns, side, startAngle, outward, fade0 } = params
  const points: StrandPoint[] = []
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const u = THREE.MathUtils.clamp(u0 + t * uSpan, 0, 1)
    const frame = spineAtU(spine, u)
    const fade = stalkTopFade(u) * fade0
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

/** Thin helical sprays orbiting the stalk with leaves along the curl. */
function buildSwirlingBranches(
  group: THREE.Object3D,
  spine: SpineSample[],
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  animPolylines: AnimPolyline[],
  branchColor: THREE.Color,
  leafColor: THREE.Color,
  rng: Rng,
) {
  const layer = new THREE.Group()
  layer.name = 'about-vine-swirl-branches'
  group.add(layer)

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
    const swirlParams = {
      u0,
      uSpan,
      steps,
      branchTurns,
      side,
      startAngle,
      outward,
      fade0,
    }
    const points = sampleSwirlBranch(spine, swirlParams, 0)

    if (points.length >= 2) {
      pushAnimPolyline(
        points,
        (s, phase) => sampleSwirlBranch(s, swirlParams, phase),
        layer,
        roots,
        animPolylines,
        branchColor,
        cfg.swirlBranchOpacity * fade0,
        cfg.swirlBranchLineWidth,
      )
    }

    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const u = THREE.MathUtils.clamp(u0 + t * uSpan, 0, 1)
      const frame = spineAtU(spine, u)
      const fade = stalkTopFade(u) * fade0
      if (fade < 0.06) continue

      if (s > 1 && s % 3 === 1 && rng() > 0.22) {
        const helixAngle = startAngle + side * branchTurns * Math.PI * 2 * t
        const r = frame.radius * (1.12 + outward * t) + t * 0.14
        const cn = Math.cos(helixAngle)
        const sn = Math.sin(helixAngle)
        const pt: StrandPoint = {
          x: frame.center.x + frame.normal.x * r * cn + frame.binormal.x * r * sn,
          y: frame.center.y + frame.normal.y * r * cn + frame.binormal.y * r * sn,
          z: frame.center.z + frame.normal.z * r * cn + frame.binormal.z * r * sn,
        }
        const size = cfg.leafSize * (0.38 + rng() * 0.42) * fade
        const swirlU = u
        const swirlT = t
        const leafSize = size
        const leafTilt = (rng() - 0.5) * 1.05
        pushAnimPolyline(
          buildLeaf({ ...frame, center: pt }, leafSize, leafTilt, 0.02),
          (sp, phase) => {
            const p = sampleSwirlBranch(sp, swirlParams, phase)
            const idx = Math.min(p.length - 1, Math.round(swirlT * (p.length - 1)))
            const center = p[idx]
            const f = spineAtU(sp, swirlU)
            return buildLeaf({ ...f, center }, leafSize, leafTilt, 0.02)
          },
          layer,
          roots,
          animPolylines,
          leafColor,
          cfg.leafOpacity * fade * 0.78,
          cfg.leafLineWidth * 0.64,
        )
      }
    }
  }
}

export function buildAboutVinePlant(
  parent: THREE.Object3D,
  cfg: AboutDnaConfig,
  roots: THREE.Object3D[],
  rng: Rng,
): AboutVinePlant {
  const group = new THREE.Group()
  group.name = 'about-vine-plant'
  group.scale.set(cfg.scaleXZ, cfg.scaleY, cfg.scaleXZ)
  parent.add(group)

  const bright = new THREE.Color(cfg.color)
  const soft = new THREE.Color(cfg.colorMuted).lerp(bright, 0.3)
  const leafColor = bright.clone().lerp(soft, 0.2)
  const branchColor = soft.clone().lerp(bright, 0.45)

  const baseSpine = buildSpineSamples(cfg)
  const animPolylines: AnimPolyline[] = []

  const stalkLayer = new THREE.Group()
  stalkLayer.name = 'about-vine-stalk'
  group.add(stalkLayer)

  for (let f = 0; f < cfg.filamentCount; f++) {
    const color = soft.clone().lerp(bright, f === 0 ? 0.48 : 0.38)
    registerHelixStrand(
      stalkLayer,
      roots,
      animPolylines,
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
      color,
      cfg.strandOpacity,
      cfg.backboneLineWidth,
    )
  }

  const stalkDotBuild = buildStalkDots(stalkLayer, baseSpine, cfg, roots, bright, rng)
  const stalkDots = stalkDotBuild?.points ?? null
  const stalkDotSeeds = stalkDotBuild?.seeds ?? []
  const artichokeColor = leafColor.clone().lerp(soft, 0.15)
  const artichokeRibColor = soft.clone().lerp(bright, 0.25)
  buildArtichokeBase(stalkLayer, cfg, roots, animPolylines, artichokeColor, artichokeRibColor, rng)
  buildWrapperVines(group, baseSpine, cfg, roots, animPolylines, bright, soft, rng)
  buildSwirlingBranches(group, baseSpine, cfg, roots, animPolylines, branchColor, leafColor, rng)
  buildLeaves(group, baseSpine, cfg, roots, animPolylines, leafColor, rng)
  buildBranches(group, baseSpine, cfg, roots, animPolylines, branchColor, leafColor, rng)

  const updatePhase = (helixPhase: number) => {
    if (!Number.isFinite(helixPhase)) return
    updateAnimPolylines(animPolylines, cfg, helixPhase)
    if (stalkDots && stalkDotSeeds.length > 0) {
      updateStalkDots(stalkDots, stalkDotSeeds, cfg, helixPhase)
    }
  }

  return { group, cfg, stalkDots, stalkDotSeeds, updatePhase }
}

export function getPlantCrossSectionRadius(cfg: AboutDnaConfig): number {
  const outer = cfg.wrapperRadiusScales[cfg.wrapperCount - 1] ?? 1.88
  return cfg.helixRadius * outer * cfg.scaleXZ
}
