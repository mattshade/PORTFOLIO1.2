import * as THREE from 'three'
import type { AboutCavernConfig } from './aboutSceneConfig'
import { ABOUT_COLORS } from './aboutSceneConfig'
import { createLineBatch, flushLineBatch } from '../OrigamiAviaryBackground/lineBatch'
import type { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'

type Rng = ReturnType<typeof createMulberry32>

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uIntensity;
  varying float vFade;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float flicker = 0.35 + 0.45 * sin(uTime * 0.9 + aPhase) * sin(uTime * 0.41 + aPhase * 1.7);
    vFade = flicker * uIntensity * (1.0 - smoothstep(8.0, 38.0, -mv.z));
    float size = aSize * uPixelRatio * (120.0 / max(1.0, -mv.z));
    gl_PointSize = clamp(size, 0.4, 5.5);
    gl_Position = projectionMatrix * mv;
  }
`

const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.48, 0.12, d);
    float alpha = core * vFade * vFade * 0.42;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(uColor * (0.7 + vFade * 0.5), alpha);
  }
`

export type CavernAtmosphereSystem = {
  root: THREE.Group
  tick: (elapsed: number, intensity: number, reducedMotion: boolean) => void
  dispose: () => void
}

export function buildCavernAtmosphere(
  parent: THREE.Object3D,
  rng: Rng,
  cfg: AboutCavernConfig,
  sceneDepth: number,
  roots: THREE.Object3D[],
): CavernAtmosphereSystem {
  const root = new THREE.Group()
  root.name = 'cavern-atmosphere'
  parent.add(root)

  const accent = new THREE.Color(cfg.accentColor)
  const muted = new THREE.Color(ABOUT_COLORS.cyanMuted)
  const particleColor = accent.clone().lerp(muted, 0.55)

  const count = 48
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rng() - 0.5) * 12
    positions[i * 3 + 1] = cfg.ceilingY * 0.35 + rng() * cfg.ceilingY * 0.55
    positions[i * 3 + 2] = -4.5 - rng() * (sceneDepth - 5)
    sizes[i] = 0.35 + rng() * 1.1
    phases[i] = rng() * Math.PI * 2
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: particleColor },
      uPixelRatio: { value: 1 },
      uIntensity: { value: 0.55 },
    },
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })

  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  root.add(points)
  roots.push(points)

  const wallColor = accent.clone().lerp(muted, 0.5)
  const span = 13
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? -1 : 1
    const batch = createLineBatch(cfg.lineOpacity * 0.38)
    const x0 = sx * span * 0.42
    const z0 = -5 - rng() * (sceneDepth - 7)
    const yTop = cfg.ceilingY - 0.2
    const yLow = 0.8
    const ribs = 5 + Math.floor(rng() * 3)
    for (let r = 0; r < ribs; r++) {
      const t = r / Math.max(1, ribs - 1)
      const y = THREE.MathUtils.lerp(yTop, yLow, t)
      const z = z0 - t * 3.2
      const x = x0 + sx * (0.15 + t * 0.35)
      batch.positions.push(x, y, z, x + sx * 0.25, y - 0.5, z - 0.35)
    }
    flushLineBatch(batch, root, wallColor, roots, sceneDepth, 1.05)
  }

  const veilBatch = createLineBatch(cfg.lineOpacity * 0.28)
  for (let i = 0; i < 4; i++) {
    const x = (rng() - 0.5) * 6
    const z = -7 - rng() * 4
    const y0 = cfg.ceilingY - 0.4
    veilBatch.positions.push(x, y0, z, x + (rng() - 0.5) * 0.4, y0 - 1.8, z - 0.5)
    veilBatch.positions.push(x, y0 - 1.8, z - 0.5, x - 0.2, y0 - 3.2, z - 0.2)
  }
  flushLineBatch(veilBatch, root, muted, roots, sceneDepth, 0.95)

  const tick = (elapsed: number, intensity: number, reducedMotion: boolean) => {
    mat.uniforms.uTime.value = elapsed
    mat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.5)
    mat.uniforms.uIntensity.value = reducedMotion ? intensity * 0.4 : intensity
    root.visible = intensity > 0.03
  }

  const dispose = () => {
    parent.remove(root)
    geo.dispose()
    mat.dispose()
  }

  return { root, tick, dispose }
}
