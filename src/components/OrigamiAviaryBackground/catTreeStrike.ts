import * as THREE from 'three'
import { CAT_TREE_TUNING } from './constants'
import type { AviaryBird } from './birdMotion'
import type { Perch } from './environment'
import { scareBirdsNearCat } from './birdMotion'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

/**
 * If a perch-resting bird is within leap range, copy its position into `outAim`,
 * run the normal scare+flee path for all birds in range, and return true.
 */
export function captureTreeLeapStrike(
  catPos: THREE.Vector3,
  birds: AviaryBird[],
  perches: Perch[],
  rng: Rng,
  elapsed: number,
  outAim: THREE.Vector3,
): boolean {
  let best: AviaryBird | null = null
  let bestD = CAT_TREE_TUNING.leapTriggerDistance
  for (const b of birds) {
    if (b.state === 'flying' || b.state === 'takeoff') continue
    const d = b.rig.root.position.distanceTo(catPos)
    if (d < bestD) {
      bestD = d
      best = b
    }
  }
  if (!best) return false
  outAim.copy(best.rig.root.position)
  scareBirdsNearCat(catPos, birds, perches, rng, elapsed)
  return true
}
