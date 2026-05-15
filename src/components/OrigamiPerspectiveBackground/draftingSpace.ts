import * as THREE from 'three'
import type { OrigamiPerspectiveTuning } from './constants'
import { ORIGAMI_PERSPECTIVE_BASE_COLORS } from './constants'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

/** Thin wireframe box — drafting reference volume */
function wireframeBox(
  w: number,
  h: number,
  d: number,
  color: THREE.Color,
  opacity: number,
): THREE.LineSegments {
  const geo = new THREE.BoxGeometry(w, h, d)
  const edges = new THREE.EdgesGeometry(geo)
  geo.dispose()
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
  })
  return new THREE.LineSegments(edges, mat)
}

/** Minimal tick marks — coordinate read, not decoration */
function tickCross(rng: Rng, z: number, lineMuted: THREE.Color, opacity: number): THREE.LineSegments {
  const s = 0.08 + rng() * 0.06
  const positions = new Float32Array([
    -s,
    0,
    0,
    s,
    0,
    0,
    0,
    -s * 0.6,
    0,
    0,
    s * 0.6,
    0,
    0,
    0,
    -s * 0.45,
    0,
    0,
    s * 0.45,
  ])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.LineBasicMaterial({
    color: lineMuted,
    transparent: true,
    opacity: opacity * 0.85,
    depthWrite: false,
    toneMapped: false,
  })
  const line = new THREE.LineSegments(geo, mat)
  line.position.set((rng() - 0.5) * 7, 0.35 + rng() * 2.2, z)
  return line
}

export function buildDraftingSpace(
  scene: THREE.Scene,
  rng: Rng,
  tuning: OrigamiPerspectiveTuning,
  accentColor: THREE.Color,
): THREE.Object3D[] {
  const roots: THREE.Object3D[] = []
  const lineMuted = new THREE.Color(ORIGAMI_PERSPECTIVE_BASE_COLORS.lineMuted)
  const accentSoft = accentColor.clone().lerp(lineMuted, 0.55)

  const floorGrid = new THREE.GridHelper(
    52,
    tuning.groundGridDivisions,
    accentSoft,
    lineMuted,
  )
  floorGrid.position.y = 0
  const gm = floorGrid.material
  if (Array.isArray(gm)) {
    gm.forEach((m) => {
      m.transparent = true
      m.opacity = tuning.gridOpacity
      m.depthWrite = false
      m.toneMapped = false
    })
  } else {
    gm.transparent = true
    gm.opacity = tuning.gridOpacity
    gm.depthWrite = false
    gm.toneMapped = false
  }
  floorGrid.rotation.y = (rng() - 0.5) * 0.03
  scene.add(floorGrid)
  roots.push(floorGrid)

  // Sparse vertical “back sheet” — depth without literal nature imagery
  const backZ = -Math.min(tuning.sceneDepth, 13) - 0.5
  const planeGeo = new THREE.PlaneGeometry(22, 12, 6, 4)
  const planeMat = new THREE.MeshBasicMaterial({
    color: lineMuted,
    wireframe: true,
    transparent: true,
    opacity: tuning.gridOpacity * 0.55,
    depthWrite: false,
    toneMapped: false,
  })
  const backPlane = new THREE.Mesh(planeGeo, planeMat)
  backPlane.position.set((rng() - 0.5) * 0.6, 1.25, backZ)
  scene.add(backPlane)
  roots.push(backPlane)

  const nFrames = tuning.constructionFrameCount
  for (let i = 0; i < nFrames; i++) {
    const box = wireframeBox(
      1.1 + rng() * 2.2,
      0.85 + rng() * 1.6,
      1.0 + rng() * 1.9,
      accentSoft,
      tuning.lineOpacity * (0.72 + rng() * 0.22),
    )
    box.position.set((rng() - 0.5) * 8, 0.5 + rng() * 1.8, -3 - rng() * (tuning.sceneDepth - 3))
    box.rotation.set((rng() - 0.5) * 0.35, rng() * Math.PI * 2, (rng() - 0.5) * 0.25)
    scene.add(box)
    roots.push(box)
  }

  const tickCount = 3 + Math.floor(rng() * 2)
  for (let i = 0; i < tickCount; i++) {
    const tick = tickCross(rng, -4 - rng() * 5, lineMuted, tuning.lineOpacity * 0.5)
    scene.add(tick)
    roots.push(tick)
  }

  return roots
}
