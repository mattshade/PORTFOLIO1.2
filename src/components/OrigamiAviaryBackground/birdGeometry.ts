import * as THREE from 'three'

type GeoPart = { positions: number[]; indices: number[] }

function pushPart(parts: GeoPart[], positions: number[], indices: number[]) {
  parts.push({ positions, indices })
}

function mergeParts(parts: GeoPart[]): THREE.BufferGeometry {
  const positions: number[] = []
  const indices: number[] = []
  let offset = 0
  for (const part of parts) {
    positions.push(...part.positions)
    for (const idx of part.indices) indices.push(idx + offset)
    offset += part.positions.length / 3
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/**
 * Classic origami crane body — vertical diamond, four facets meeting at the crown.
 * Forward = +Z (neck), back = -Z (tail).
 */
function buildCraneBodyParts(): GeoPart[] {
  const p: GeoPart[] = []
  const crown = [0, 0.16, 0]
  const front = [0, 0.02, 0.09]
  const back = [0, 0.02, -0.09]
  const left = [-0.065, 0.09, 0]
  const right = [0.065, 0.09, 0]
  const keel = [0, -0.04, 0]

  pushPart(p, [...crown, ...left, ...front], [0, 1, 2])
  pushPart(p, [...crown, ...front, ...right], [0, 1, 2])
  pushPart(p, [...crown, ...right, ...back], [0, 1, 2])
  pushPart(p, [...crown, ...back, ...left], [0, 1, 2])
  pushPart(p, [...left, ...front, ...keel], [0, 1, 2])
  pushPart(p, [...right, ...front, ...keel], [0, 1, 2])
  pushPart(p, [...left, ...back, ...keel], [0, 1, 2])
  pushPart(p, [...right, ...back, ...keel], [0, 1, 2])
  return p
}

/** Neck — long tapered strip from front of body, rising forward-up */
function buildCraneNeckParts(): GeoPart[] {
  const p: GeoPart[] = []
  pushPart(p, [0, 0, 0, -0.018, 0.05, 0.04, 0.018, 0.05, 0.04], [0, 1, 2])
  pushPart(p, [0, 0.05, 0.04, -0.014, 0.14, 0.1, 0.014, 0.14, 0.1], [0, 1, 2])
  pushPart(p, [0, 0.14, 0.1, -0.01, 0.24, 0.16, 0.01, 0.24, 0.16], [0, 1, 2])
  pushPart(p, [0, 0.24, 0.16, 0, 0.3, 0.2, -0.008, 0.27, 0.18], [0, 1, 2])
  pushPart(p, [0, 0.24, 0.16, 0.008, 0.27, 0.18, 0, 0.3, 0.2], [0, 1, 2])
  return p
}

/** Beak folds down at neck tip (reference head triangle) */
function buildCraneHeadParts(): GeoPart[] {
  const p: GeoPart[] = []
  pushPart(p, [0, 0, 0, -0.024, 0.02, 0.02, 0.024, 0.02, 0.02], [0, 1, 2])
  pushPart(p, [0, 0.02, 0.02, 0, 0.06, 0.05, -0.016, 0.04, 0.035], [0, 1, 2])
  pushPart(p, [0, 0.02, 0.02, 0.016, 0.04, 0.035, 0, 0.06, 0.05], [0, 1, 2])
  pushPart(p, [0, 0.06, 0.05, 0, 0.04, 0.12, -0.01, 0.05, 0.09], [0, 1, 2])
  pushPart(p, [0, 0.06, 0.05, 0.01, 0.05, 0.09, 0, 0.04, 0.12], [0, 1, 2])
  return p
}

/** Large triangular wing — pivots from body shoulder, extends laterally and slightly up */
function buildCraneWingParts(sign: 1 | -1): GeoPart[] {
  const s = sign
  const p: GeoPart[] = []
  pushPart(p, [0, 0, 0, s * -0.42, 0.14, 0.02, s * -0.08, 0.02, -0.02], [0, 1, 2])
  pushPart(p, [s * -0.42, 0.14, 0.02, s * -0.38, 0.2, 0.08, s * -0.1, 0.08, 0.04], [0, 1, 2])
  pushPart(p, [0, 0, 0, s * -0.1, 0.08, 0.04, s * -0.08, 0.02, -0.02], [0, 1, 2])
  pushPart(p, [s * -0.2, 0.06, 0.01, s * -0.34, 0.12, 0.03, s * -0.28, 0.1, -0.02], [0, 1, 2])
  return p
}

/** Tail — mirror of neck from rear of body */
function buildCraneTailParts(): GeoPart[] {
  const p: GeoPart[] = []
  pushPart(p, [0, 0, 0, -0.018, 0.05, -0.04, 0.018, 0.05, -0.04], [0, 1, 2])
  pushPart(p, [0, 0.05, -0.04, -0.014, 0.14, -0.1, 0.014, 0.14, -0.1], [0, 1, 2])
  pushPart(p, [0, 0.14, -0.1, -0.01, 0.24, -0.16, 0.01, 0.24, -0.16], [0, 1, 2])
  pushPart(p, [0, 0.24, -0.16, 0, 0.3, -0.2, -0.008, 0.27, -0.18], [0, 1, 2])
  pushPart(p, [0, 0.24, -0.16, 0.008, 0.27, -0.18, 0, 0.3, -0.2], [0, 1, 2])
  return p
}

function addCreaseLines(parent: THREE.Group, segments: number[][], color: number, opacity: number) {
  const pos: number[] = []
  for (const [ax, ay, az, bx, by, bz] of segments) pos.push(ax, ay, az, bx, by, bz)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  parent.add(
    new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        fog: true,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  )
}

function addPartMesh(
  parent: THREE.Group,
  geo: THREE.BufferGeometry,
  fillColor: number,
  accentColor: number,
  fillOpacity: number,
  edgeOpacity: number,
  creaseAngle: number,
): THREE.LineBasicMaterial {
  parent.add(
    new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: fillColor,
        transparent: true,
        opacity: fillOpacity,
        side: THREE.DoubleSide,
        depthWrite: true,
        toneMapped: false,
      }),
    ),
  )
  const edgeMat = new THREE.LineBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: edgeOpacity,
    fog: true,
    depthWrite: false,
    toneMapped: false,
  })
  parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, creaseAngle), edgeMat))
  return edgeMat
}

export type BirdDetailLevel = 'flock' | 'sculptural'

export type BirdRig = {
  root: THREE.Group
  body: THREE.Group
  neck: THREE.Group
  head: THREE.Group
  leftWing: THREE.Group
  rightWing: THREE.Group
  tail: THREE.Group
  edgeMats: THREE.LineBasicMaterial[]
  /** Spread-up display angle (reference pose) */
  wingSpreadAngle: number
  /** Folded-down resting angle */
  wingFoldRest: number
}

export function createArticulatedOrigamiBird(
  fillColor: number,
  accentColor: number,
  detail: BirdDetailLevel = 'flock',
): BirdRig {
  const root = new THREE.Group()
  const fillOpacity = detail === 'sculptural' ? 0.9 : 0.84
  const edgeOpacity = detail === 'sculptural' ? 0.54 : 0.46
  const crease = detail === 'sculptural' ? 16 : 20
  const wingSpreadAngle = 0.42
  const wingFoldRest = 1.05
  const edgeMats: THREE.LineBasicMaterial[] = []
  const creaseOpacity = edgeOpacity * 0.6

  const body = new THREE.Group()
  edgeMats.push(addPartMesh(body, mergeParts(buildCraneBodyParts()), fillColor, accentColor, fillOpacity, edgeOpacity, crease))
  addCreaseLines(
    body,
    [
      [0, 0.16, 0, 0, 0.02, 0.09],
      [0, 0.16, 0, 0, 0.02, -0.09],
      [-0.065, 0.09, 0, 0.065, 0.09, 0],
      [0, 0.16, 0, 0, -0.04, 0],
    ],
    accentColor,
    creaseOpacity,
  )
  root.add(body)

  const neck = new THREE.Group()
  neck.position.set(0, 0.08, 0.09)
  edgeMats.push(addPartMesh(neck, mergeParts(buildCraneNeckParts()), fillColor, accentColor, fillOpacity, edgeOpacity, crease - 2))
  body.add(neck)

  const head = new THREE.Group()
  head.position.set(0, 0.3, 0.2)
  head.rotation.x = 0.55
  edgeMats.push(addPartMesh(head, mergeParts(buildCraneHeadParts()), fillColor, accentColor, fillOpacity, edgeOpacity * 1.08, crease - 4))
  neck.add(head)

  const leftWing = new THREE.Group()
  leftWing.position.set(-0.065, 0.1, 0)
  leftWing.rotation.order = 'YXZ'
  leftWing.rotation.x = wingSpreadAngle
  edgeMats.push(addPartMesh(leftWing, mergeParts(buildCraneWingParts(-1)), fillColor, accentColor, fillOpacity, edgeOpacity, crease))
  addCreaseLines(leftWing, [[0, 0, 0, -0.42, 0.14, 0.02]], accentColor, creaseOpacity)
  body.add(leftWing)

  const rightWing = new THREE.Group()
  rightWing.position.set(0.065, 0.1, 0)
  rightWing.rotation.order = 'YXZ'
  rightWing.rotation.x = wingSpreadAngle
  edgeMats.push(addPartMesh(rightWing, mergeParts(buildCraneWingParts(1)), fillColor, accentColor, fillOpacity, edgeOpacity, crease))
  addCreaseLines(rightWing, [[0, 0, 0, 0.42, 0.14, 0.02]], accentColor, creaseOpacity)
  body.add(rightWing)

  const tail = new THREE.Group()
  tail.position.set(0, 0.08, -0.09)
  edgeMats.push(addPartMesh(tail, mergeParts(buildCraneTailParts()), fillColor, accentColor, fillOpacity * 0.95, edgeOpacity, crease))
  body.add(tail)

  return { root, body, neck, head, leftWing, rightWing, tail, edgeMats, wingSpreadAngle, wingFoldRest }
}

/** @deprecated use createArticulatedOrigamiBird */
export function createOrigamiBirdMesh(
  fillColor: number,
  accentColor: number,
  detail: BirdDetailLevel = 'flock',
  fillOpacity?: number,
  edgeOpacity?: number,
): { group: THREE.Group; edgeMat: THREE.LineBasicMaterial } {
  const rig = createArticulatedOrigamiBird(fillColor, accentColor, detail)
  if (fillOpacity !== undefined || edgeOpacity !== undefined) {
    rig.root.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshBasicMaterial) {
        o.material.opacity = fillOpacity ?? o.material.opacity
      }
    })
    rig.edgeMats.forEach((m) => {
      m.opacity = edgeOpacity ?? m.opacity
    })
  }
  return { group: rig.root, edgeMat: rig.edgeMats[0] }
}
