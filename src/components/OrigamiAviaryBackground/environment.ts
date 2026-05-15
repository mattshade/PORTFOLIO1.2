import * as THREE from 'three'
import type { OrigamiAviaryTuning } from './constants'
import { AVIARY_COLORS } from './constants'
import { buildDetailedForest } from './forestStructures'
import { buildAviaryArchitecture } from './architecture'
import { createOrigamiCat, type OrigamiCatSystem } from './origamiCat'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type Perch = {
  position: THREE.Vector3
  yaw: number
  depthLayer: number
  surface: 'tree' | 'ground'
}

function buildGroundPerches(rng: Rng, tuning: OrigamiAviaryTuning): Perch[] {
  const perches: Perch[] = []
  const span = tuning.forestHalfWidth * 2
  const count = 6 + Math.floor(rng() * 5)

  for (let i = 0; i < count; i++) {
    perches.push({
      position: new THREE.Vector3(
        (rng() - 0.5) * span * (0.5 + rng() * 0.42),
        0.03 + rng() * 0.05,
        -2.4 - rng() * (tuning.sceneDepth - 2.5),
      ),
      yaw: rng() * Math.PI * 2,
      depthLayer: 0,
      surface: 'ground',
    })
  }

  return perches
}

export function buildAviaryEnvironment(
  world: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  accent: THREE.Color,
): {
  roots: THREE.Object3D[]
  perches: Perch[]
  depthLayers: THREE.Group[]
  cat: OrigamiCatSystem
} {
  const roots: THREE.Object3D[] = []
  const lineMuted = new THREE.Color(AVIARY_COLORS.lineMuted)
  const accentSoft = accent.clone().lerp(lineMuted, 0.5)

  const depthLayers = [new THREE.Group(), new THREE.Group(), new THREE.Group()]
  depthLayers.forEach((g) => world.add(g))
  roots.push(...depthLayers)

  const groundSize = tuning.forestHalfWidth * 2.35
  const grid = new THREE.GridHelper(groundSize, tuning.groundGridDivisions, accentSoft, lineMuted)
  grid.position.y = 0
  const gm = grid.material
  const setGridMat = (m: THREE.Material) => {
    const line = m as THREE.LineBasicMaterial
    line.transparent = true
    line.opacity = tuning.gridOpacity
    line.depthWrite = false
    line.fog = true
    line.toneMapped = false
  }
  if (Array.isArray(gm)) gm.forEach(setGridMat)
  else setGridMat(gm)
  world.add(grid)
  roots.push(grid)

  const perches = buildDetailedForest(world, rng, tuning, accent, depthLayers, roots)
  perches.push(...buildGroundPerches(rng, tuning))
  buildAviaryArchitecture(depthLayers[1], rng, tuning, accent, roots)

  const backPlaneGeo = new THREE.PlaneGeometry(groundSize * 0.55, 16, 12, 8)
  const backPlane = new THREE.Mesh(
    backPlaneGeo,
    new THREE.MeshBasicMaterial({
      color: lineMuted,
      wireframe: true,
      transparent: true,
      opacity: tuning.gridOpacity * 0.42,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  backPlane.position.set(0, 1.5, -tuning.sceneDepth * 0.72)
  depthLayers[2].add(backPlane)
  roots.push(backPlane)

  const horizonGeo = new THREE.PlaneGeometry(groundSize * 0.92, 0.02, 1, 1)
  const horizon = new THREE.Mesh(
    horizonGeo,
    new THREE.MeshBasicMaterial({
      color: accentSoft,
      transparent: true,
      opacity: tuning.lineOpacity * 0.25,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  horizon.position.set(0, 0.01, -tuning.sceneDepth * 0.35)
  horizon.rotation.x = -Math.PI / 2
  world.add(horizon)
  roots.push(horizon)

  const cat = createOrigamiCat(depthLayers[2], rng, tuning, accent, lineMuted, roots)

  return { roots, perches, depthLayers, cat }
}
