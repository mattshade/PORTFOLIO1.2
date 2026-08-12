import * as THREE from 'three'
import type { OrigamiAviaryTuning } from './constants'
import { AVIARY_COLORS } from './constants'
import { createLineBatch, flushLineBatch, isLine2Object, disposeLine2 } from './lineBatch'
import type { InteractionState } from './interaction'
import type { createMulberry32 } from './seededRandom'

type Rng = ReturnType<typeof createMulberry32>

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aFlicker;
  attribute float aGlow;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uIntensity;
  varying float vFade;
  varying float vSpark;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float t = uTime * aFlicker;
    float w1 = sin(t + aPhase);
    float w2 = sin(t * 1.63 + aPhase * 2.17);
    float w3 = sin(t * 0.37 + aPhase * 4.91);
    float spark = pow(max(0.0, sin(t * 0.55 + aPhase * 6.3)), 14.0);
    float flicker = aGlow * (0.22 + 0.38 * w1 * w1 + 0.2 * w2 + 0.12 * w3 + spark * 1.35);
    vSpark = spark;
    vFade = flicker * uIntensity * (1.0 - smoothstep(10.0, 44.0, -mv.z));
    float sizeBoost = 1.0 + spark * 0.85 + max(0.0, flicker - 0.5) * 0.35;
    float size = aSize * sizeBoost * uPixelRatio * (140.0 / max(1.0, -mv.z));
    gl_PointSize = clamp(size, 0.5, 7.5);
    gl_Position = projectionMatrix * mv;
  }
`

const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFade;
  varying float vSpark;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.2, d);
    float halo = smoothstep(0.5, 0.15, d) * 0.18;
    float bright = vFade * vFade * (0.65 + vSpark * 0.9);
    float alpha = (core + halo) * bright * 0.48;
    if (alpha < 0.006) discard;
    vec3 col = uColor * (0.75 + bright * 0.65 + vSpark * 0.4);
    gl_FragColor = vec4(col, alpha);
  }
`

export type AtmosphereSystem = {
  roots: THREE.Object3D[]
  glowLayer: THREE.Group
  arcParent: THREE.Group
  tick: (
    elapsed: number,
    delta: number,
    state: InteractionState,
    tuning: OrigamiAviaryTuning,
    reducedMotion: boolean,
    intensityScale?: number,
  ) => void
  dispose: () => void
}

export function buildAviaryAtmosphere(
  parent: THREE.Object3D,
  rng: Rng,
  tuning: OrigamiAviaryTuning,
  accent: THREE.Color,
): AtmosphereSystem {
  const roots: THREE.Object3D[] = []
  const glowLayer = new THREE.Group()
  glowLayer.name = 'aviary-glow'
  parent.add(glowLayer)
  roots.push(glowLayer)

  const muted = new THREE.Color(AVIARY_COLORS.lineMuted)
  const particleColor = accent.clone().lerp(muted, 0.72)

  const count = tuning.particleCount
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  const flickers = new Float32Array(count)
  const glows = new Float32Array(count)
  const drift: { vx: number; vy: number; vz: number; phase: number }[] = []

  const ringSpan = tuning.forestHalfWidth * 2

  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2
    const radius = tuning.forestHalfWidth * (0.18 + rng() * 0.72)
    positions[i * 3] = Math.sin(angle) * radius
    positions[i * 3 + 1] = 0.8 + rng() * 6.5
    positions[i * 3 + 2] = -Math.cos(angle) * radius
    sizes[i] = 0.5 + rng() * 1.5
    phases[i] = rng() * Math.PI * 2
    flickers[i] = 0.35 + rng() * 2.4
    glows[i] = 0.2 + rng() * 0.85
    drift.push({
      vx: (rng() - 0.5) * 0.03,
      vy: (rng() - 0.5) * 0.012,
      vz: (rng() - 0.5) * 0.02,
      phase: rng() * Math.PI * 2,
    })
  }

  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  particleGeo.setAttribute('aFlicker', new THREE.BufferAttribute(flickers, 1))
  particleGeo.setAttribute('aGlow', new THREE.BufferAttribute(glows, 1))

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: particleColor },
      uPixelRatio: { value: 1 },
      uIntensity: { value: tuning.particleIntensity },
    },
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })

  const particles = new THREE.Points(particleGeo, particleMat)
  particles.frustumCulled = false
  glowLayer.add(particles)
  roots.push(particles)

  const bloomColor = accent.clone().lerp(new THREE.Color(0xbef264), 0.45)

  for (let i = 0; i < tuning.lightColumnCount; i++) {
    const colBatch = createLineBatch(tuning.lineOpacity * 0.38, tuning.lineWidth * 0.75)
    const angle = rng() * Math.PI * 2
    const radius = tuning.forestHalfWidth * (0.22 + rng() * 0.55)
    const x = Math.sin(angle) * radius
    const z = -Math.cos(angle) * radius
    const h = 2.5 + rng() * 4.5
    const y0 = 0.05
    const segs = 8 + Math.floor(rng() * 6)
    for (let s = 0; s < segs; s++) {
      const t0 = s / segs
      const t1 = (s + 1) / segs
      const yA = y0 + h * t0
      const yB = y0 + h * t1
      const wobble = Math.sin(t0 * Math.PI) * 0.04
      colBatch.positions.push(x + wobble, yA, z, x - wobble * 0.5, yB, z)
    }
    flushLineBatch(colBatch, glowLayer, bloomColor, roots, tuning.sceneDepth, tuning.lineWidth * 0.75)
  }

  const arcBatch = createLineBatch(tuning.lineOpacity * 0.34, tuning.lineWidth * 0.9)
  const arcR = 11
  const arcSegs = tuning.ceilingArcCount
  for (let a = 0; a < arcSegs; a++) {
    const baseYaw = (a / arcSegs) * Math.PI * 2 + rng() * 0.2
    const steps = 14
    let px = 0
    let py = 5.8 + rng() * 0.6
    let pz = 0
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const yaw = baseYaw + t * 0.35
      const nx = Math.cos(yaw) * arcR * t
      const nz = Math.sin(yaw) * arcR * t * 0.55 - 6
      const ny = py - t * 0.15
      arcBatch.positions.push(px, py, pz, nx, ny, nz)
      px = nx
      py = ny
      pz = nz
    }
  }
  const arcParent = new THREE.Group()
  parent.add(arcParent)
  flushLineBatch(arcBatch, arcParent, muted, roots, tuning.sceneDepth, tuning.lineWidth * 0.9)

  const tick = (
    elapsed: number,
    delta: number,
    state: InteractionState,
    tuning: OrigamiAviaryTuning,
    reducedMotion: boolean,
    intensityScale = 1,
  ) => {
    particleMat.uniforms.uTime.value = elapsed
    particleMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, tuning.maxPixelRatio)
    const base = reducedMotion ? tuning.particleIntensity * 0.55 : tuning.particleIntensity
    particleMat.uniforms.uIntensity.value = base * intensityScale

    const driftScale = reducedMotion ? 0 : tuning.atmosphereDrift * delta * 0.65
    const xLimit = ringSpan * 0.5
    const px = state.pointerSmooth.x * tuning.parallaxIntensity * 0.045
    const py = state.pointerSmooth.y * tuning.parallaxIntensity * 0.028

    glowLayer.position.set(px * 0.14, py * 0.09, 0)
    glowLayer.rotation.y = px * 0.004
    glowLayer.rotation.x = py * 0.003

    if (!reducedMotion) {
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < count; i++) {
        const d = drift[i]
        let x = posAttr.getX(i) + d.vx * driftScale
        let y = posAttr.getY(i) + d.vy * driftScale
        let z = posAttr.getZ(i) + d.vz * driftScale
        if (x < -xLimit) x = xLimit
        if (x > xLimit) x = -xLimit
        if (y < 0.5) y = 7
        if (y > 7.5) y = 0.8
        if (z > -1.5) z = -tuning.sceneDepth - 1
        if (z < -tuning.sceneDepth - 2) z = -2
        posAttr.setXYZ(i, x, y, z)
      }
      posAttr.needsUpdate = true
    }
  }

  const dispose = () => {
    parent.remove(glowLayer)
    parent.remove(arcParent)
    particleGeo.dispose()
    particleMat.dispose()
    roots.forEach((r) => {
      if (isLine2Object(r)) disposeLine2(r)
    })
  }

  return { roots, glowLayer, arcParent, tick, dispose }
}
