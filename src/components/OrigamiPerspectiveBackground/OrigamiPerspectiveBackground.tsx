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
}

const BASE_PARALLAX = 0.028

export function OrigamiPerspectiveBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  const reducedMotionRef = useRef(false)
  /**
   * React 18 Strict Mode runs mount → cleanup → mount on one instance.
   * Disposing WebGLRenderer on the first cleanup often breaks the second init.
   * Reuse one renderer for this component’s lifetime; dispose on `pagehide`.
   */
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let raf = 0
    let scene: THREE.Scene | undefined
    let birds: SpaceBird[] = []
    let draftingRoots: THREE.Object3D[] = []

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const onMq = () => {
      reducedMotionRef.current = mq.matches
    }
    mq.addEventListener('change', onMq)

    const tabHiddenRef = { v: document.hidden }
    const onVis = () => {
      tabHiddenRef.v = document.hidden
    }
    document.addEventListener('visibilitychange', onVis)

    const pointer = new THREE.Vector2(0, 0)
    const pointerSmooth = new THREE.Vector2(0, 0)
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      pointer.y = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    let resize: (() => void) | undefined

    const onPageHide = () => {
      const r = rendererRef.current
      if (!r) return
      disposeRenderer(r)
      rendererRef.current = null
      if (r.domElement.parentNode) {
        r.domElement.parentNode.removeChild(r.domElement)
      }
    }
    window.addEventListener('pagehide', onPageHide)

    let teardownScene: (() => void) | null = null

    try {
      const tuning = getResponsivePerspectiveTuning()
      const rng = createMulberry32(tuning.seed)
      scene = new THREE.Scene()
      scene.background = new THREE.Color(ORIGAMI_PERSPECTIVE_BASE_COLORS.background)
      scene.fog = new THREE.FogExp2(ORIGAMI_PERSPECTIVE_BASE_COLORS.fog, tuning.fogDensity)

      const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 110)
      const baseCam = new THREE.Vector3(0, 1.32, 5.35)
      const lookAt = new THREE.Vector3(0, 1.48, -9.2)
      camera.position.copy(baseCam)
      camera.lookAt(lookAt)

      const renderer = rendererRef.current ?? new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
      if (!rendererRef.current) {
        rendererRef.current = renderer
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tuning.maxPixelRatio))
      renderer.setClearColor(ORIGAMI_PERSPECTIVE_BASE_COLORS.background, 1)
      if (renderer.domElement.parentNode !== mount) {
        mount.appendChild(renderer.domElement)
      }

      const accentColor = new THREE.Color(tuning.accentColor)
      draftingRoots = buildDraftingSpace(scene, rng, tuning, accentColor)
      birds = populateOrigamiBirds(scene, rng, tuning)

      const clock = new THREE.Clock()
      const pointerSmoothing =
        tuning.pointerSmoothing > 0 ? tuning.pointerSmoothing : DEFAULT_ORIGAMI_PERSPECTIVE_TUNING.pointerSmoothing

      resize = () => {
        if (!renderer || disposed) return
        const w = Math.max(1, window.innerWidth)
        const h = Math.max(1, window.innerHeight)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h, false)
      }
      resize()
      requestAnimationFrame(() => resize?.())
      window.addEventListener('resize', resize)

      const animate = () => {
        if (disposed || !renderer || !scene) return
        raf = requestAnimationFrame(animate)
        try {
          const rawDelta = clock.getDelta()
          const delta = tabHiddenRef.v ? 0 : Math.min(rawDelta, 0.05)
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
        } catch (e) {
          console.error('[OrigamiPerspectiveBackground] frame error', e)
          disposed = true
        }
      }
      animate()

      teardownScene = () => {
        disposed = true
        cancelAnimationFrame(raf)
        mq.removeEventListener('change', onMq)
        document.removeEventListener('visibilitychange', onVis)
        window.removeEventListener('pointermove', onPointer)
        if (resize) window.removeEventListener('resize', resize)
        if (scene) {
          birds.forEach((b) => {
            scene.remove(b.mesh)
            disposeObject3D(b.mesh)
          })
          draftingRoots.forEach((r) => {
            scene.remove(r)
            disposeObject3D(r)
          })
        }
      }
    } catch (e) {
      console.error('[OrigamiPerspectiveBackground] init failed — background disabled', e)
      mq.removeEventListener('change', onMq)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onPointer)
      if (resize) window.removeEventListener('resize', resize)
    }

    return () => {
      teardownScene?.()
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [])

  return (
    <div className="origami-perspective-background" aria-hidden>
      <div ref={mountRef} className="origami-perspective-background__canvas-host" />
      <div className="origami-perspective-background__readability" />
    </div>
  )
}
