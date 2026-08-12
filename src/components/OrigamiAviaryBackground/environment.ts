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
  const inner = Math.max(3.6, tuning.forestHalfWidth * 0.1)
  const outer = tuning.forestHalfWidth * 0.6
  const count = tuning.posterComposition
    ? 3 + Math.floor(rng() * 3)
    : 6 + Math.floor(rng() * 5)

  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2
    const radius = inner + rng() * (outer - inner)
    perches.push({
      position: new THREE.Vector3(
        Math.sin(angle) * radius,
        0.03 + rng() * 0.05,
        -Math.cos(angle) * radius,
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
  options?: { includeCat?: boolean },
): {
  roots: THREE.Object3D[]
  perches: Perch[]
  depthLayers: THREE.Group[]
  cats: OrigamiCatSystem[]
} {
  const roots: THREE.Object3D[] = []
  const lineMuted = new THREE.Color(AVIARY_COLORS.lineMuted)
  const accentSoft = accent.clone().lerp(lineMuted, 0.5)

  const depthLayers = [new THREE.Group(), new THREE.Group(), new THREE.Group()]
  depthLayers.forEach((g) => world.add(g))
  roots.push(...depthLayers)

  const groundSize = tuning.forestHalfWidth * 2.65
  const grid = new THREE.GridHelper(groundSize, tuning.groundGridDivisions, accentSoft, lineMuted)
  grid.position.y = 0
  const gm = grid.material
  const setGridMat = (m: THREE.Material) => {
    const line = m as THREE.LineBasicMaterial
    line.transparent = true
    line.opacity = tuning.gridOpacity
    line.userData.baseOpacity = tuning.gridOpacity
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

  const horizonGeo = new THREE.PlaneGeometry(groundSize * 0.92, 0.02, 1, 1)
  const horizon = new THREE.Mesh(
    horizonGeo,
    new THREE.MeshBasicMaterial({
      color: accentSoft,
      transparent: true,
      opacity: tuning.lineOpacity * 0.25,
      depthWrite: false,
      toneMapped: false,
      userData: { baseOpacity: tuning.lineOpacity * 0.25 },
    }),
  )
  horizon.position.set(0, 0.01, 0)
  horizon.rotation.x = -Math.PI / 2
  world.add(horizon)
  roots.push(horizon)

  const includeCat = options?.includeCat !== false
  const cats: OrigamiCatSystem[] = []
  if (includeCat) {
    cats.push(createOrigamiCat(world, rng, tuning, accent, lineMuted, roots))
    cats.push(
      createOrigamiCat(world, rng, tuning, accent, lineMuted, roots, {
        x: tuning.forestHalfWidth * 0.42,
        z: -8.4,
      }),
    )
  }

  return { roots, perches, depthLayers, cats }
}
