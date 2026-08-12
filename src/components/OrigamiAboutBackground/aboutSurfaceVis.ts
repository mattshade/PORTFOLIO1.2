import * as THREE from 'three'

/** 1 = full forest; at full entry a canopy silhouette remains overhead. */
export function computeAboutSurfaceVis(entry: number): number {
  const canopy = 0.24
  if (entry <= 0) return 1
  if (entry >= 1) return canopy
  return THREE.MathUtils.lerp(1, canopy, THREE.MathUtils.smoothstep(entry, 0.22, 0.92))
}
