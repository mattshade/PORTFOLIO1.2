import * as THREE from 'three'

/** Folded triangular-plate bird — angular paper craft, not an animal mesh */
function createFoldedPaperBirdGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array([
    0, 0.032, 0.07,
    0, -0.012, -0.095,
    -0.095, 0.004, -0.015,
    0.095, 0.004, -0.015,
    0, -0.038, 0.015,
    0, 0.01, 0.11,
  ])

  const indices = [
    0, 2, 3,
    1, 3, 2,
    0, 2, 4,
    0, 4, 3,
    1, 2, 4,
    1, 4, 3,
    0, 3, 5,
    0, 5, 2,
  ]

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export type OrigamiBirdMaterials = {
  edgeMat: THREE.LineBasicMaterial
  dispose: () => void
}

/**
 * Graphite body + accent crease lines. Caller owns motion on `edgeMat.opacity` for faint sweeps.
 */
export function createOrigamiBirdMesh(
  birdFill: number,
  accentColor: number,
  fillOpacity = 0.52,
  baseEdgeOpacity = 0.16,
): { group: THREE.Group; edgeMat: THREE.LineBasicMaterial } {
  const group = new THREE.Group()
  const bodyGeo = createFoldedPaperBirdGeometry()

  const fillMat = new THREE.MeshBasicMaterial({
    color: birdFill,
    transparent: true,
    opacity: fillOpacity,
    side: THREE.DoubleSide,
    depthWrite: true,
  })
  group.add(new THREE.Mesh(bodyGeo, fillMat))

  const edgeGeo = new THREE.EdgesGeometry(bodyGeo, 36)
  const edgeMat = new THREE.LineBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: baseEdgeOpacity,
    depthTest: true,
  })
  group.add(new THREE.LineSegments(edgeGeo, edgeMat))

  return { group, edgeMat }
}
