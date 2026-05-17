import * as THREE from 'three'
import { createLineBatch, flushLineBatch } from '../OrigamiAviaryBackground/lineBatch'
import type { AboutCavernConfig } from './aboutSceneConfig'
import type { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type BatPerch = {
  position: THREE.Vector3
  yaw: number
}

function seg(batch: { positions: number[] }, ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  batch.positions.push(ax, ay, az, bx, by, bz)
}

export function buildCavernStructures(
  parent: THREE.Object3D,
  rng: Rng,
  cfg: AboutCavernConfig,
  sceneDepth: number,
  accent: THREE.Color,
  muted: THREE.Color,
  roots: THREE.Object3D[],
): BatPerch[] {
  const perches: BatPerch[] = []
  const span = 14
  const lineW = 1.15
  const color = accent.clone().lerp(muted, 0.35)

  const midChamberCount = Math.min(cfg.batCount + 2, 6)
  for (let i = 0; i < midChamberCount; i++) {
    perches.push({
      position: new THREE.Vector3(
        (rng() - 0.5) * span * 0.65,
        cfg.ceilingY * 0.55 + rng() * 1.4,
        -6.2 - rng() * Math.min(5.5, sceneDepth - 6),
      ),
      yaw: rng() * Math.PI * 2,
    })
  }

  for (let i = 0; i < cfg.stalactiteCount; i++) {
    const x = (rng() - 0.5) * span * 0.92
    const z = -3.5 - rng() * (sceneDepth - 4)
    const topY = cfg.ceilingY + rng() * 0.4
    const len = 1.2 + rng() * 2.8
    const batch = createLineBatch(cfg.lineOpacity * (0.85 + rng() * 0.2))
    const tipY = topY - len
    seg(batch, x, topY, z, x + (rng() - 0.5) * 0.15, topY - len * 0.45, z)
    seg(batch, x + (rng() - 0.5) * 0.15, topY - len * 0.45, z, x, tipY, z)
    if (rng() > 0.55) {
      seg(batch, x, tipY, z, x + (rng() - 0.5) * 0.35, tipY - 0.25, z + (rng() - 0.5) * 0.2)
    }
    flushLineBatch(batch, parent, color, roots, sceneDepth, lineW)

    if (rng() > 0.42 && perches.length < cfg.batCount + cfg.flyingBatCount) {
      perches.push({
        position: new THREE.Vector3(x, topY - 0.08, z),
        yaw: rng() * Math.PI * 2,
      })
    }
  }

  for (let i = 0; i < cfg.archCount; i++) {
    const x = (rng() - 0.5) * span * 0.7
    const z = -5 - rng() * (sceneDepth - 6)
    const y0 = cfg.ceilingY - 0.5
    const batch = createLineBatch(cfg.lineOpacity * 0.7)
    const w = 2.2 + rng() * 2.5
    seg(batch, x - w, y0, z, x, y0 - 0.35, z - 0.4)
    seg(batch, x, y0 - 0.35, z - 0.4, x + w, y0, z)
    seg(batch, x - w * 0.7, y0, z, x + w * 0.7, y0, z)
    flushLineBatch(batch, parent, color, roots, sceneDepth, lineW * 0.9)
  }

  const floorBatch = createLineBatch(cfg.lineOpacity * 0.45)
  const gz = -sceneDepth * 0.55
  for (let i = 0; i < 5; i++) {
    const fx = (rng() - 0.5) * span
    seg(floorBatch, fx, -1.2, gz, fx + (rng() - 0.5), -1.5, gz + rng() * 2)
  }
  flushLineBatch(floorBatch, parent, muted, roots, sceneDepth, lineW * 0.75)

  const poolBatch = createLineBatch(cfg.lineOpacity * 0.32)
  const poolZ = gz + 1.2
  const poolW = 4.5 + rng() * 2
  seg(poolBatch, -poolW * 0.5, -1.35, poolZ, poolW * 0.5, -1.35, poolZ)
  seg(poolBatch, -poolW * 0.35, -1.35, poolZ + 0.4, poolW * 0.35, -1.35, poolZ - 0.35)
  flushLineBatch(poolBatch, parent, accent, roots, sceneDepth, lineW * 0.7)

  const columnBatch = createLineBatch(cfg.lineOpacity * 0.36)
  for (let i = 0; i < 4; i++) {
    const cx = (rng() - 0.5) * span * 0.5
    const cz = -5.5 - rng() * (sceneDepth - 7)
    const h = 2.4 + rng() * 2.8
    seg(columnBatch, cx, -1.1, cz, cx, -1.1 + h, cz)
    seg(columnBatch, cx, -1.1 + h, cz, cx + (rng() - 0.5) * 0.2, -1.1 + h * 0.7, cz - 0.25)
  }
  flushLineBatch(columnBatch, parent, color, roots, sceneDepth, lineW * 0.85)

  while (perches.length < cfg.batCount + 2) {
    perches.push({
      position: new THREE.Vector3(
        (rng() - 0.5) * span * 0.75,
        cfg.ceilingY - 0.1 - rng() * 0.3,
        -4 - rng() * (sceneDepth - 5),
      ),
      yaw: rng() * Math.PI * 2,
    })
  }

  return perches
}
