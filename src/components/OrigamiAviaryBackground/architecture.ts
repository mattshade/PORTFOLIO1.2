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
  const inner = Math.max(3.6, tuning.forestHalfWidth * 0.1)
  const outer = tuning.forestHalfWidth * 0.6

  for (let i = 0; i < tuning.portalFrameCount; i++) {
    const batch = createLineBatch(tuning.lineOpacity * 0.48, tuning.lineWidth * 0.95)
    const angle = (i / Math.max(1, tuning.portalFrameCount)) * Math.PI * 2 + (rng() - 0.5) * 0.55
    const radius = inner + rng() * (outer - inner)
    const x = Math.sin(angle) * radius
    const z = -Math.cos(angle) * radius
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
    const angle = (g / guideCount) * Math.PI * 2
    const radius = inner + (outer - inner) * 0.35
    const x = Math.sin(angle) * radius
    const z = -Math.cos(angle) * radius
    const xFar = Math.sin(angle) * outer * 0.72
    const zFar = -Math.cos(angle) * outer * 0.72
    seg(guides.positions, x, 0.02, z, xFar, 0.02, zFar)
  }
  flushLineBatch(guides, parent, muted, roots, tuning.sceneDepth, tuning.lineWidth * 0.85)
}
