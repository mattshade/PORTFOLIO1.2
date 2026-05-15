import * as THREE from 'three'
import type { OrigamiAviaryTuning } from './constants'
import { AVIARY_COLORS } from './constants'
import { createLineBatch, flushLineBatch } from './lineBatch'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

function seg(pos: number[], ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  pos.push(ax, ay, az, bx, by, bz)
}

/** Portal frames and floor perspective guides — architectural, not organic */
export function buildAviaryArchitecture(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  accent: THREE.Color,
  roots: THREE.Object3D[],
): void {
  const muted = new THREE.Color(AVIARY_COLORS.lineMuted)
  const accentSoft = accent.clone().lerp(muted, 0.4)
  const span = tuning.forestHalfWidth * 2

  for (let i = 0; i < tuning.portalFrameCount; i++) {
    const batch = createLineBatch(tuning.lineOpacity * 0.48, tuning.lineWidth * 0.95)
    const z = -3.5 - rng() * (tuning.sceneDepth - 3)
    const x = (rng() - 0.5) * span * 0.75
    const w = 1.4 + rng() * 1.8
    const h = 2.2 + rng() * 2.8
    const y = 0.02
    seg(batch.positions, x - w * 0.5, y, z, x - w * 0.5, y + h, z)
    seg(batch.positions, x + w * 0.5, y, z, x + w * 0.5, y + h, z)
    seg(batch.positions, x - w * 0.5, y + h, z, x + w * 0.5, y + h, z)
    seg(batch.positions, x - w * 0.5, y, z, x + w * 0.5, y, z)
    const lintel = h * (0.55 + rng() * 0.15)
    seg(batch.positions, x - w * 0.5, y + lintel, z, x + w * 0.5, y + lintel, z)
    seg(batch.positions, x, y + lintel, z, x, y + h, z)
    flushLineBatch(batch, parent, i % 2 === 0 ? accentSoft : muted, roots, tuning.sceneDepth, tuning.lineWidth)
  }

  const guides = createLineBatch(tuning.gridOpacity * 0.85, tuning.lineWidth * 0.85)
  const guideCount = tuning.floorGuideCount
  for (let g = 0; g < guideCount; g++) {
    const t = (g + 1) / (guideCount + 1)
    const x = (t - 0.5) * span
    seg(guides.positions, x, 0.02, -1.2, x * 0.38, 0.02, -tuning.sceneDepth * 0.55)
  }
  flushLineBatch(guides, parent, muted, roots, tuning.sceneDepth, tuning.lineWidth * 0.85)
}
