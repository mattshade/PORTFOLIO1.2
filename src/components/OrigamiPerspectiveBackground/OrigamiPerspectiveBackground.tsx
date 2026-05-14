import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './OrigamiPerspectiveBackground.css'
import {
  DEFAULT_ORIGAMI_PERSPECTIVE_TUNING,
  ORIGAMI_PERSPECTIVE_BASE_COLORS,
  getResponsivePerspectiveTuning,
} from './constants'
import { createMulberry32 } from './seededRandom'
import { buildDraftingSpace } from './draftingSpace'
import { populateOrigamiBirds, updateOrigamiBirds, type SpaceBird } from './birdMotion'

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
      obj.geometry?.dispose()
      const mat = obj.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    }
    if (obj instanceof THREE.InstancedMesh) {
      obj.geometry.dispose()
      const mat = obj.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat.dispose()
    }
  })
}

function disposeRenderer(renderer: THREE.WebGLRenderer) {
  renderer.dispose()
  renderer.forceContextLoss?.()
}

/** Base world-units parallax before `parallaxIntensity` multiplier — intentionally tiny */
const BASE_PARALLAX = 0.028

export function OrigamiPerspectiveBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const onMq = () => {
      reducedMotionRef.current = mq.matches
    }
    mq.addEventListener('change', onMq)

    const tuning = getResponsivePerspectiveTuning()
    const rng = createMulberry32(tuning.seed)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(ORIGAMI_PERSPECTIVE_BASE_COLORS.background)
    scene.fog = new THREE.FogExp2(ORIGAMI_PERSPECTIVE_BASE_COLORS.fog, tuning.fogDensity)

    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 110)
    const baseCam = new THREE.Vector3(0, 1.32, 5.35)
    const lookAt = new THREE.Vector3(0, 1.48, -9.2)
    camera.position.copy(baseCam)
    camera.lookAt(lookAt)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tuning.maxPixelRatio))
    renderer.setClearColor(ORIGAMI_PERSPECTIVE_BASE_COLORS.background, 1)
    mount.appendChild(renderer.domElement)

    const accentColor = new THREE.Color(tuning.accentColor)
    const draftingRoots = buildDraftingSpace(scene, rng, tuning, accentColor)
    const birds: SpaceBird[] = populateOrigamiBirds(scene, rng, tuning)

    const clock = new THREE.Clock()
    let raf = 0
    let tabHidden = document.hidden
    const onVis = () => {
      tabHidden = document.hidden
    }
    document.addEventListener('visibilitychange', onVis)

    const pointer = new THREE.Vector2(0, 0)
    const pointerSmooth = new THREE.Vector2(0, 0)
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    resize()
    window.addEventListener('resize', resize)

    const pointerSmoothing =
      tuning.pointerSmoothing > 0 ? tuning.pointerSmoothing : DEFAULT_ORIGAMI_PERSPECTIVE_TUNING.pointerSmoothing

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const rawDelta = clock.getDelta()
      const delta = tabHidden ? 0 : Math.min(rawDelta, 0.05)
      const elapsed = clock.getElapsedTime()
      const rm = reducedMotionRef.current

      if (!rm) {
        const k = pointerSmoothing
        const alpha = 1 - Math.exp(-delta * k)
        pointerSmooth.x += (pointer.x - pointerSmooth.x) * alpha
        pointerSmooth.y += (pointer.y - pointerSmooth.y) * alpha

        const s = BASE_PARALLAX * tuning.parallaxIntensity
        const px = pointerSmooth.x
        const py = pointerSmooth.y
        camera.position.x = baseCam.x + px * s
        camera.position.y = baseCam.y - py * s * 0.4
        camera.position.z = baseCam.z
        camera.lookAt(
          lookAt.x + px * s * 0.2 * tuning.parallaxIntensity,
          lookAt.y - py * s * 0.11 * tuning.parallaxIntensity,
          lookAt.z,
        )
      } else {
        camera.position.copy(baseCam)
        camera.lookAt(lookAt)
        pointerSmooth.copy(pointer)
      }

      updateOrigamiBirds(birds, elapsed, delta, rm, rng, tuning)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', onMq)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', resize)
      birds.forEach((b) => {
        scene.remove(b.mesh)
        disposeObject3D(b.mesh)
      })
      draftingRoots.forEach((r) => {
        scene.remove(r)
        disposeObject3D(r)
      })
      disposeRenderer(renderer)
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="origami-perspective-background" aria-hidden>
      <div className="origami-perspective-background__readability" />
      <div ref={mountRef} className="origami-perspective-background__canvas-host" />
    </div>
  )
}
