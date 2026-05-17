import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'

export type LineBatch = {
  positions: number[]
  opacity: number
  lineWidth?: number
}

const lineMaterials: LineMaterial[] = []
let resolution = new THREE.Vector2(1, 1)

export function createLineBatch(opacity: number, lineWidth?: number): LineBatch {
  return { positions: [], opacity, lineWidth }
}

export function setLineResolution(width: number, height: number) {
  resolution.set(width, height)
  for (const mat of lineMaterials) mat.resolution.copy(resolution)
}

export function registerLineMaterial(material: LineMaterial) {
  lineMaterials.push(material)
  material.resolution.copy(resolution)
}

export function clearLineMaterialRegistry() {
  lineMaterials.length = 0
}

function depthOpacityFactor(positions: number[], sceneDepth: number, depthFade = 1) {
  let zSum = 0
  let count = 0
  for (let i = 2; i < positions.length; i += 3) {
    zSum += positions[i]
    count++
  }
  if (count === 0) return 1
  const norm = THREE.MathUtils.clamp((-zSum / count - 1.8) / sceneDepth, 0, 1)
  const minMul = THREE.MathUtils.lerp(0.52, 0.78, depthFade)
  return THREE.MathUtils.lerp(1.08, minMul, norm)
}

export type LineBatchFlushOptions = {
  /** 0 = no depth-based opacity falloff (e.g. cavern vines). */
  depthFade?: number
  fog?: boolean
  worldUnits?: boolean
  alphaToCoverage?: boolean
}

export function flushLineBatch(
  batch: LineBatch,
  parent: THREE.Object3D,
  color: THREE.Color,
  roots: THREE.Object3D[],
  sceneDepth: number,
  lineWidth = 1.1,
  options: LineBatchFlushOptions = {},
): Line2 | null {
  const depthFade = options.depthFade ?? 1
  const useFog = options.fog ?? true
  const worldUnits = options.worldUnits ?? false
  const alphaToCoverage = options.alphaToCoverage ?? !worldUnits
  if (batch.positions.length < 6) return null

  const geo = new LineGeometry()
  geo.setPositions(batch.positions)

  const width = batch.lineWidth ?? lineWidth
  const depthMul = depthOpacityFactor(batch.positions, sceneDepth, depthFade)
  const opacity = batch.opacity * depthMul
  const mat = new LineMaterial({
    color: color.getHex(),
    linewidth: width,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: true,
    fog: useFog,
    worldUnits,
    alphaToCoverage,
    toneMapped: false,
  })
  mat.userData.baseOpacity = opacity
  registerLineMaterial(mat)

  const line = new Line2(geo, mat)
  line.computeLineDistances()
  line.frustumCulled = false
  parent.add(line)
  roots.push(line)
  batch.positions = []
  return line
}

export function isLine2Object(obj: THREE.Object3D): obj is Line2 {
  return obj instanceof Line2
}

export function disposeLine2(obj: Line2) {
  obj.geometry.dispose()
  const mat = obj.material
  if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
  else mat.dispose()
}
