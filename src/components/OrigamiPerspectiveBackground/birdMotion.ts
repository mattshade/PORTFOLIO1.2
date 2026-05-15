import * as THREE from 'three'
import { createOrigamiBirdMesh } from './birdGeometry'
import type { OrigamiPerspectiveTuning } from './constants'
import { ORIGAMI_PERSPECTIVE_BASE_COLORS } from './constants'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

export type SpaceBird = {
  mesh: THREE.Group
  kind: 'large' | 'small'
  anchor: THREE.Vector3
  phases: number[]
  glideActive: boolean
  glideT: number
  glideDur: number
  glideFrom: THREE.Vector3
  glideTo: THREE.Vector3
  nextGlideAt: number
  edgeMat: THREE.LineBasicMaterial
  baseEdgeOpacity: number
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function populateOrigamiBirds(
  scene: THREE.Scene,
  rng: Rng,
  tuning: OrigamiPerspectiveTuning,
): SpaceBird[] {
  const accent = tuning.accentColor

  for (let i = 0; i < tuning.largeBirdCount; i++) {
    const side = i === 0 ? -1 : 1
    const { group, edgeMat } = createOrigamiBirdMesh(fill, accent, 0.82, 0.42)
    const anchor = new THREE.Vector3(
      side * (2.05 + rng() * 0.35),
      1.05 + rng() * 0.55,
      -2.05 - rng() * 1.25,
    )
    group.position.copy(anchor)
    group.scale.setScalar(2.85 + rng() * 0.65)
    group.rotation.set((rng() - 0.5) * 0.22, side * 0.45 + (rng() - 0.5) * 0.35, (rng() - 0.5) * 0.18)
    group.renderOrder = 3
    scene.add(group)
    birds.push({
      mesh: group,
      kind: 'large',
      anchor: anchor.clone(),
      phases: Array.from({ length: 6 }, () => rng() * Math.PI * 2),
      glideActive: false,
      glideT: 0,
      glideDur: 1,
      glideFrom: new THREE.Vector3(),
      glideTo: new THREE.Vector3(),
      nextGlideAt: Number.POSITIVE_INFINITY,
      edgeMat,
      baseEdgeOpacity: 0.38,
    })
  }

  for (let i = 0; i < tuning.smallBirdCount; i++) {
    const { group, edgeMat } = createOrigamiBirdMesh(fill, accent, 0.78, 0.4)
    const bx = (rng() - 0.5) * 4.8
    const anchor = new THREE.Vector3(
      Math.abs(bx) < 0.5 ? bx + (rng() > 0.5 ? 1.15 : -1.15) : bx,
      0.88 + rng() * 1.35,
      -2.35 - rng() * 3.2,
    )
    group.position.copy(anchor)
    group.scale.setScalar(0.92 + rng() * 0.42)
    group.rotation.set((rng() - 0.5) * 0.45, rng() * Math.PI, (rng() - 0.5) * 0.28)
    group.renderOrder = 3
    scene.add(group)
    birds.push({
      mesh: group,
      kind: 'small',
      anchor: anchor.clone(),
      phases: Array.from({ length: 6 }, () => rng() * Math.PI * 2),
      glideActive: false,
      glideT: 0,
      glideDur: 1,
      glideFrom: new THREE.Vector3(),
      glideTo: new THREE.Vector3(),
      nextGlideAt: 8 + rng() * 36,
      edgeMat,
      baseEdgeOpacity: 0.4,
    })
  }

  return birds
}

/**
 * Folded-paper motion: bounded oscillation (no endless spin), slow glides for small birds,
 * non-synchronized phases. Edge opacity carries an extremely slow “light wash” without strobing.
 */
export function updateOrigamiBirds(
  birds: SpaceBird[],
  elapsed: number,
  delta: number,
  reducedMotion: boolean,
  rng: Rng,
  tuning: OrigamiPerspectiveTuning,
) {
  const ai = tuning.animationIntensity

  for (const b of birds) {
    const pulse =
      0.5 * Math.sin(elapsed * 0.072 + b.phases[0]) + 0.5 * Math.sin(elapsed * 0.031 + b.phases[3])
    const edgeBoost = pulse * 0.06 * ai
    b.edgeMat.opacity = THREE.MathUtils.clamp(b.baseEdgeOpacity + edgeBoost, 0.24, 0.58)

    if (reducedMotion) {
      b.mesh.position.copy(b.anchor)
      if (b.kind === 'large') {
        b.mesh.rotation.set(
          Math.sin(b.phases[1]) * 0.14,
          b.phases[2] * 0.35,
          Math.cos(b.phases[4]) * 0.1,
        )
      } else {
        b.mesh.rotation.set(
          Math.sin(b.phases[1]) * 0.18,
          b.phases[2] * 0.25,
          Math.cos(b.phases[4]) * 0.12,
        )
      }
      continue
    }

    if (b.kind === 'large') {
      const t = elapsed * ai
      b.mesh.position.copy(b.anchor)
      b.mesh.position.y += Math.sin(t * 0.1 + b.phases[1]) * 0.035 * ai
      b.mesh.position.x += Math.sin(t * 0.075 + b.phases[2]) * 0.018 * ai
      b.mesh.rotation.x = Math.sin(t * 0.088 + b.phases[3]) * 0.11
      b.mesh.rotation.y = b.phases[4] + Math.sin(t * 0.055 + b.phases[5]) * 0.09
      b.mesh.rotation.z = Math.sin(t * 0.065 + b.phases[0]) * 0.07
      continue
    }

    if (!b.glideActive) {
      const t = elapsed * ai * 0.12
      b.mesh.position.set(
        b.anchor.x + Math.sin(t + b.phases[0]) * 0.2 * ai,
        b.anchor.y + Math.sin(t * 0.68 + b.phases[1]) * 0.095 * ai,
        b.anchor.z + Math.sin(t * 0.47 + b.phases[2]) * 0.16 * ai,
      )
      b.mesh.rotation.x = Math.sin(elapsed * 0.17 * ai + b.phases[0]) * 0.11
      b.mesh.rotation.y = b.phases[2] + Math.sin(elapsed * 0.1 * ai + b.phases[3]) * 0.22
      b.mesh.rotation.z = Math.cos(elapsed * 0.13 * ai + b.phases[4]) * 0.09

      if (elapsed >= b.nextGlideAt) {
        b.glideActive = true
        b.glideT = 0
        b.glideDur = 36 + rng() * 48
        b.glideFrom.copy(b.mesh.position)
        const depth = -2.5 - rng() * 3.2
        b.glideTo.set((rng() - 0.5) * 5.8, 0.72 + rng() * 1.25, depth)
      }
    } else {
      b.glideT += delta / b.glideDur
      const u = Math.min(1, b.glideT)
      const e = easeInOutQuad(u)
      b.mesh.position.lerpVectors(b.glideFrom, b.glideTo, e)

      const dir = new THREE.Vector3().subVectors(b.glideTo, b.glideFrom)
      const yaw = Math.atan2(dir.x, dir.z)
      b.mesh.rotation.y += (yaw - b.mesh.rotation.y) * Math.min(1, delta * 0.55)
      b.mesh.rotation.x *= 0.96
      b.mesh.rotation.z = Math.sin(u * Math.PI) * 0.06

      if (u >= 1) {
        b.glideActive = false
        b.anchor.copy(b.glideTo)
        b.glideT = 0
        b.nextGlideAt = elapsed + 22 + rng() * 52
      }
    }
  }
}
