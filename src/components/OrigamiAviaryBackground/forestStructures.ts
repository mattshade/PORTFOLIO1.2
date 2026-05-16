import * as THREE from 'three'
import type { OrigamiAviaryTuning } from './constants'
import { AVIARY_COLORS } from './constants'
import type { Perch } from './environment'
import { createLineBatch, flushLineBatch, type LineBatch } from './lineBatch'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

function seg(batch: LineBatch, ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  batch.positions.push(ax, ay, az, bx, by, bz)
}

/** Curved segment chain — organic trunk/twig paths */
function growCurvedBranch(
  batch: LineBatch,
  ox: number,
  oy: number,
  oz: number,
  dirX: number,
  dirY: number,
  dirZ: number,
  length: number,
  depth: number,
  rng: Rng,
  spread: number,
  gravity: number,
) {
  const steps = 3 + Math.floor(rng() * 2)
  let px = ox
  let py = oy
  let pz = oz
  let dx = dirX
  let dy = dirY
  let dz = dirZ
  const mag0 = Math.hypot(dx, dy, dz) || 1
  dx /= mag0
  dy /= mag0
  dz /= mag0

  for (let s = 0; s < steps; s++) {
    const segLen = (length / steps) * (0.85 + rng() * 0.3)
    const wobbleX = (rng() - 0.5) * spread * 0.35
    const wobbleZ = (rng() - 0.5) * spread * 0.35
    dy = Math.max(0.08, dy - gravity * 0.12 + (rng() - 0.45) * 0.08)
    const nx = dx + wobbleX
    const ny = dy
    const nz = dz + wobbleZ
    const m = Math.hypot(nx, ny, nz) || 1
    const ex = px + (nx / m) * segLen
    const ey = py + (ny / m) * segLen
    const ez = pz + (nz / m) * segLen
    seg(batch, px, py, pz, ex, ey, ez)
    px = ex
    py = ey
    pz = ez
    dx = nx / m
    dy = ny / m
    dz = nz / m
  }

  if (depth <= 0) return

  const childCount = depth > 2 ? 2 + Math.floor(rng() * 2) : 1 + Math.floor(rng() * 2)
  for (let i = 0; i < childCount; i++) {
    const yaw = (rng() - 0.5) * spread * 1.15
    const pitch = 0.15 + rng() * 0.5
    const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw)
    const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw)
    const ry = dy * 0.4 + pitch
    const rm = Math.hypot(rx, ry, rz) || 1
    growCurvedBranch(
      batch,
      px,
      py,
      pz,
      rx / rm,
      ry / rm,
      rz / rm,
      length * (0.5 + rng() * 0.22),
      depth - 1,
      rng,
      spread * 0.88,
      gravity + 0.08,
    )
  }
}

function addFineBranchlets(
  batch: LineBatch,
  ox: number,
  oy: number,
  oz: number,
  dirX: number,
  dirY: number,
  dirZ: number,
  count: number,
  rng: Rng,
) {
  for (let i = 0; i < count; i++) {
    const len = 0.12 + rng() * 0.22
    const yaw = (rng() - 0.5) * 1.4
    const pitch = (rng() - 0.5) * 0.9
    const rx = dirX * Math.cos(yaw) - dirZ * Math.sin(yaw)
    const rz = dirX * Math.sin(yaw) + dirZ * Math.cos(yaw)
    const ry = dirY + pitch
    const m = Math.hypot(rx, ry, rz) || 1
    seg(batch, ox, oy, oz, ox + (rx / m) * len, oy + (ry / m) * len, oz + (rz / m) * len)
  }
}

/** Soft foliage volume — radiating twigs, not geometric domes */
function addOrganicCanopy(
  batch: LineBatch,
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  rng: Rng,
) {
  const twigs = 16 + Math.floor(rng() * 12)
  for (let i = 0; i < twigs; i++) {
    const a = rng() * Math.PI * 2
    const incl = 0.2 + rng() * 0.75
    const len = radius * (0.45 + rng() * 0.65)
    const dx = Math.cos(a) * Math.cos(incl) * len
    const dy = Math.sin(incl) * len * (0.35 + rng() * 0.35)
    const dz = Math.sin(a) * Math.cos(incl) * len * 0.65
    const midX = cx + dx * 0.45 + (rng() - 0.5) * radius * 0.15
    const midY = cy + dy * 0.5 + (rng() - 0.5) * radius * 0.1
    const midZ = cz + dz * 0.45 + (rng() - 0.5) * radius * 0.1
    seg(batch, cx, cy, cz, midX, midY, midZ)
    seg(batch, midX, midY, midZ, cx + dx, cy + dy, cz + dz)
    addFineBranchlets(batch, cx + dx, cy + dy, cz + dz, dx, dy, dz, 1 + Math.floor(rng() * 2), rng)
  }
  const droops = 4 + Math.floor(rng() * 4)
  for (let d = 0; d < droops; d++) {
    const a = rng() * Math.PI * 2
    const len = radius * (0.35 + rng() * 0.4)
    seg(
      batch,
      cx,
      cy,
      cz,
      cx + Math.cos(a) * len * 0.5,
      cy - len * 0.25,
      cz + Math.sin(a) * len * 0.35,
    )
  }
}

function addOrganicRoots(
  batch: LineBatch,
  x: number,
  y: number,
  z: number,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
) {
  const n = Math.max(2, Math.floor((4 + Math.floor(rng() * 3)) * tuning.forestRootDensity))
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.6
    const reach = 0.3 + rng() * 0.45
    const sag = 0.02 + rng() * 0.06
    const mx = x + Math.cos(a) * reach * 0.55
    const mz = z + Math.sin(a) * reach * 0.3
    seg(batch, x, y, z, mx, y + sag, mz)
    seg(batch, mx, y + sag, mz, x + Math.cos(a) * reach, y, z + Math.sin(a) * reach * 0.4)
  }
}

function buildOrganicTrunk(
  batch: LineBatch,
  x: number,
  z: number,
  height: number,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
): { topX: number; topY: number; topZ: number; leanX: number } {
  const segs = 12 + Math.floor(rng() * 7)
  const fine = Math.min(1, Math.max(0, tuning.forestFineDetail))
  let px = x
  let py = 0
  let pz = z
  const leanX = (rng() - 0.5) * 0.12
  const leanZ = (rng() - 0.5) * 0.06
  const waveAmp = 0.04 + rng() * 0.05

  for (let s = 1; s <= segs; s++) {
    const t = s / segs
    const nx = x + leanX * t + Math.sin(t * Math.PI * 1.6 + rng() * 0.5) * waveAmp * (1 - t * 0.3)
    const ny = height * t
    const nz = z + leanZ * t + Math.cos(t * Math.PI * 2.1) * waveAmp * 0.6
    seg(batch, px, py, pz, nx, ny, nz)
    if (s > 2 && s < segs - 1 && rng() > 1 - 0.45 * fine) {
      addFineBranchlets(batch, nx, ny, nz, nx - px, ny - py, nz - pz, 2 + Math.floor(rng() * 3), rng)
    }
    px = nx
    py = ny
    pz = nz
  }

  return { topX: px, topY: py, topZ: pz, leanX }
}

export function buildDetailedForestTree(
  rng: Rng,
  x: number,
  z: number,
  height: number,
  tuning: OrigamiAviaryTuning,
  layerOpacity: number,
): { lines: LineBatch; perches: Perch[] } {
  const batch = createLineBatch(layerOpacity)
  const perches: Perch[] = []
  const fine = Math.min(1, Math.max(0, tuning.forestFineDetail))
  const limbDensity = Math.min(1.2, Math.max(0.35, tuning.forestLimbDensity))

  addOrganicRoots(batch, x, 0, z, rng, tuning)

  const trunk = buildOrganicTrunk(batch, x, z, height, rng, tuning)
  const trunkLean = trunk.leanX

  for (let s = 0; s < 2 + Math.floor(rng() * 2); s++) {
    const t = 0.35 + rng() * 0.35
    perches.push({
      position: new THREE.Vector3(
        x + trunkLean * t + (rng() - 0.5) * 0.15,
        height * t + (rng() - 0.5) * 0.08,
        z + (rng() - 0.5) * 0.1,
      ),
      yaw: (rng() - 0.5) * 1.4,
      depthLayer: 0,
      surface: 'tree',
    })
  }

  const limbCount = Math.max(3, Math.floor((5 + Math.floor(rng() * 5)) * limbDensity))
  for (let b = 0; b < limbCount; b++) {
    const t = 0.38 + (b / limbCount) * 0.52 + (rng() - 0.5) * 0.08
    const by = height * Math.min(0.95, t)
    const bx = x + trunkLean * t + (rng() - 0.5) * 0.08
    const bz = z + (rng() - 0.5) * 0.12
    const yaw = rng() * Math.PI * 2
    const spread = 0.55 + rng() * 0.35
    const dx = Math.cos(yaw) * spread
    const dy = 0.35 + rng() * 0.4
    const dz = Math.sin(yaw) * spread * 0.55
    const mag = Math.hypot(dx, dy, dz) || 1

    growCurvedBranch(
      batch,
      bx,
      by,
      bz,
      dx / mag,
      dy / mag,
      dz / mag,
      0.85 + rng() * 1.05,
      tuning.branchDepth,
      rng,
      1.45 + rng() * 0.45,
      0.15,
    )

    addFineBranchlets(
      batch,
      bx,
      by,
      bz,
      dx / mag,
      dy / mag,
      dz / mag,
      Math.max(1, Math.floor((3 + Math.floor(rng() * 3)) * fine)),
      rng,
    )

    const tipX = bx + (dx / mag) * (0.65 + rng() * 0.35)
    const tipY = by + (dy / mag) * (0.65 + rng() * 0.35)
    const tipZ = bz + (dz / mag) * (0.65 + rng() * 0.35)

    if (rng() > 1 - 0.8 * fine) {
      addOrganicCanopy(batch, tipX, tipY + 0.1, tipZ, 0.35 + rng() * 0.4, rng)
      perches.push({
        position: new THREE.Vector3(tipX, tipY + 0.05, tipZ),
        yaw: yaw + (rng() - 0.5) * 0.6,
        depthLayer: 1,
        surface: 'tree',
      })
    }
  }

  if (rng() > 1 - 0.65 * fine) {
    addOrganicCanopy(batch, trunk.topX, trunk.topY + 0.05, trunk.topZ, 0.4 + rng() * 0.35, rng)
  }

  return { lines: batch, perches }
}

function placeForestTree(
  rng: Rng,
  x: number,
  z: number,
  layer: number,
  tuning: OrigamiAviaryTuning,
  accentSoft: THREE.Color,
  lineMuted: THREE.Color,
  depthLayers: THREE.Group[],
  roots: THREE.Object3D[],
  treeAnchors: { x: number; y: number; z: number }[],
  perches: Perch[],
) {
  const height = 3.2 + rng() * 6.4
  const opacity = tuning.lineOpacity * (0.72 + layer * 0.12)
  treeAnchors.push({ x, y: height * 0.62, z })
  const tree = buildDetailedForestTree(rng, x, z, height, tuning, opacity)
  perches.push(...tree.perches.map((p) => ({ ...p, depthLayer: layer })))
  flushLineBatch(
    tree.lines,
    depthLayers[layer],
    layer === 2 ? lineMuted : accentSoft,
    roots,
    tuning.sceneDepth,
    tuning.lineWidth,
  )
}

function addLatticePanel(
  batch: LineBatch,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  divisions: number,
) {
  const cols = divisions
  const rows = Math.floor(divisions * 0.6)
  for (let c = 0; c <= cols; c++) {
    const tx = x + (c / cols - 0.5) * w
    seg(batch, tx, y, z, tx, y + h, z)
  }
  for (let r = 0; r <= rows; r++) {
    const ty = y + (r / rows) * h
    seg(batch, x - w * 0.5, ty, z, x + w * 0.5, ty, z)
  }
}

export function buildDetailedForest(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  accent: THREE.Color,
  depthLayers: THREE.Group[],
  roots: THREE.Object3D[],
): Perch[] {
  const perches: Perch[] = []
  const lineMuted = new THREE.Color(AVIARY_COLORS.lineMuted)
  const accentSoft = accent.clone().lerp(lineMuted, 0.45)

  const treeAnchors: { x: number; y: number; z: number }[] = []

  const span = tuning.forestHalfWidth * 2
  const centerFillCount = tuning.posterComposition
    ? Math.max(0, Math.round(tuning.treeCount * tuning.forestCenterFillFraction))
    : Math.max(4, Math.round(tuning.treeCount * tuning.forestCenterFillFraction))

  for (let i = 0; i < tuning.treeCount; i++) {
    const layer = i % 3
    const z = -2.2 - rng() * (tuning.sceneDepth - 2)
    let x: number
    if (i % 8 === 0) {
      x = (rng() > 0.5 ? 1 : -1) * tuning.forestHalfWidth * (0.82 + rng() * 0.18)
    } else if (rng() < 0.38) {
      x = (rng() - 0.5) * span * (0.38 + rng() * 0.22)
    } else {
      x = (rng() - 0.5) * span
    }
    placeForestTree(rng, x, z, layer, tuning, accentSoft, lineMuted, depthLayers, roots, treeAnchors, perches)
  }

  // Extra trees in the center / mid-ground where random placement often leaves gaps
  for (let i = 0; i < centerFillCount; i++) {
    const layer = i % 3
    const z = -2.6 - rng() * (tuning.sceneDepth - 2.8)
    const band = rng()
    let x: number
    if (band < 0.55) {
      x = (rng() - 0.5) * span * (0.28 + rng() * 0.18)
      if (Math.abs(x) < span * 0.07) x += (x < 0 ? -1 : 1) * span * 0.11
    } else if (band < 0.82) {
      const side = rng() > 0.5 ? 1 : -1
      x = side * tuning.forestHalfWidth * (0.32 + rng() * 0.22)
    } else {
      x = (rng() - 0.5) * span * 0.62
    }
    placeForestTree(rng, x, z, layer, tuning, accentSoft, lineMuted, depthLayers, roots, treeAnchors, perches)
  }

  const archMul = Math.min(1.25, Math.max(0, tuning.forestArchitectureDensity))

  for (let i = 0; i < Math.max(0, Math.round(tuning.latticePanelCount * archMul)); i++) {
    const layer = 1 + (i % 2)
    const batch = createLineBatch(tuning.lineOpacity * 0.28)
    addLatticePanel(
      batch,
      (rng() - 0.5) * span * 0.65,
      0.8 + rng() * 2.5,
      -4 - rng() * 5,
      1.2 + rng() * 1.5,
      1.8 + rng() * 1.2,
      3 + Math.floor(rng() * 2),
    )
    flushLineBatch(batch, depthLayers[layer], lineMuted, roots, tuning.sceneDepth, tuning.lineWidth * 0.9)
  }

  const vineN =
    treeAnchors.length > 1 ? Math.max(0, Math.round(tuning.vineConnectionCount * archMul)) : 0
  for (let i = 0; i < vineN; i++) {
    const a = treeAnchors[Math.floor(rng() * treeAnchors.length)]
    const b = treeAnchors[Math.floor(rng() * treeAnchors.length)]
    const batch = createLineBatch(tuning.lineOpacity * 0.28)
    const midY = Math.max(a.y, b.y) + 0.5 + rng() * 1.1
    const sag = 0.25 + rng() * 0.35
    seg(batch, a.x, a.y, a.z, (a.x + b.x) * 0.5, midY, (a.z + b.z) * 0.5)
    seg(
      batch,
      (a.x + b.x) * 0.5,
      midY,
      (a.z + b.z) * 0.5,
      (a.x + b.x) * 0.5 + (rng() - 0.5) * 0.3,
      midY - sag,
      (a.z + b.z) * 0.5,
    )
    seg(batch, (a.x + b.x) * 0.5 + (rng() - 0.5) * 0.3, midY - sag, (a.z + b.z) * 0.5, b.x, b.y, b.z)
    flushLineBatch(batch, depthLayers[1], accentSoft, roots, tuning.sceneDepth, tuning.lineWidth)
  }

  for (let i = 0; i < Math.max(0, Math.round(tuning.suspendedLineCount * archMul)); i++) {
    const batch = createLineBatch(tuning.lineOpacity * 0.32)
    const z = -5 - rng() * 6
    const y = 2.2 + rng() * 2.8
    const x0 = (rng() - 0.5) * span * 0.85
    const x1 = x0 + (rng() - 0.5) * span * 0.2
    const droop = 0.2 + rng() * 0.35
    seg(batch, x0, y, z, (x0 + x1) * 0.5, y - droop, z - 0.1)
    seg(batch, (x0 + x1) * 0.5, y - droop, z - 0.1, x1, y - 0.1, z - 0.2)
    flushLineBatch(batch, depthLayers[0], lineMuted, roots, tuning.sceneDepth, tuning.lineWidth * 0.85)
  }

  return perches
}
