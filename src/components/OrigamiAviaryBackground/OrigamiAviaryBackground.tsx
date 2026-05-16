import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './OrigamiAviaryBackground.css'
import { AVIARY_COLORS, getResponsiveAviaryTuning } from './constants'
import { createMulberry32 } from './seededRandom'
import { buildAviaryEnvironment } from './environment'
import {
  createInteractionState,
  updateInteractionState,
  applyCameraInteraction,
  applyEnvironmentInteraction,
} from './interaction'
import {
  populateAviaryBirds,
  updateAviaryBirds,
  disposeAviaryBirds,
  handleCatBirdCollisions,
  type AviaryBird,
} from './birdMotion'
import { buildAviaryAtmosphere, type AtmosphereSystem } from './atmosphere'
import {
  applyBottomAnchor,
  applyScrollParallaxRotation,
  applyWideForestCamera,
  BOTTOM_ANCHOR_CAMERA,
  BOTTOM_ANCHOR_LOOK,
} from './sceneAnchor'
import { clearLineMaterialRegistry, isLine2Object, disposeLine2, setLineResolution } from './lineBatch'
import { createAviaryComposer, type AviaryComposer } from './renderPipeline'

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (isLine2Object(obj)) {
      disposeLine2(obj)
      return
    }
    if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
      obj.geometry?.dispose()
      const mat = obj.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    }
  })
}

export function OrigamiAviaryBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  const reducedMotionRef = useRef(false)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const scrollNormRef = useRef(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let raf = 0
    let birds: AviaryBird[] = []
    let envRoots: THREE.Object3D[] = []
    let depthLayers: THREE.Group[] = []
    let perches: ReturnType<typeof buildAviaryEnvironment>['perches'] = []
    let atmosphere: AtmosphereSystem | undefined
    let cat: ReturnType<typeof buildAviaryEnvironment>['cat'] | undefined
    let pipeline: AviaryComposer | undefined
    let scene: THREE.Scene | undefined
    let stage: THREE.Group | undefined
    let world: THREE.Group | undefined
    let camera: THREE.PerspectiveCamera | undefined

    const interaction = createInteractionState()
    const pointer = new THREE.Vector2(0, 0)
    const catPosScratch = new THREE.Vector3()

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const onMq = () => {
      reducedMotionRef.current = mq.matches
    }
    mq.addEventListener('change', onMq)

    const tabHiddenRef = { v: document.hidden }
    document.addEventListener('visibilitychange', () => {
      tabHiddenRef.v = document.hidden
    })

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      pointer.y = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      scrollNormRef.current = window.scrollY / max
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    let resize: (() => void) | undefined
    let teardownScene: (() => void) | null = null

    const onPageHide = () => {
      const r = rendererRef.current
      if (!r) return
      r.dispose()
      rendererRef.current = null
      if (r.domElement.parentNode) r.domElement.parentNode.removeChild(r.domElement)
    }
    window.addEventListener('pagehide', onPageHide)

    try {
      const tuning = getResponsiveAviaryTuning()
      const rng = createMulberry32(tuning.seed)
      scene = new THREE.Scene()
      scene.background = new THREE.Color(AVIARY_COLORS.background)
      scene.fog = new THREE.FogExp2(0x0c0e0c, tuning.fogDensity)

      stage = new THREE.Group()
      stage.name = 'aviary-stage'
      scene.add(stage)

      world = new THREE.Group()
      world.name = 'aviary-world'
      stage.add(world)

      camera = new THREE.PerspectiveCamera(tuning.baseFov, 1, 0.1, 120)
      const baseCam = BOTTOM_ANCHOR_CAMERA.clone().add(
        new THREE.Vector3(tuning.cameraOffsetX, tuning.cameraOffsetY, tuning.cameraOffsetZ),
      )
      const baseLook = BOTTOM_ANCHOR_LOOK.clone()
      baseLook.y += tuning.lookAtOffsetY
      camera.position.copy(baseCam)
      camera.lookAt(baseLook)

      const renderer =
        rendererRef.current ??
        new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
      if (!rendererRef.current) rendererRef.current = renderer
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tuning.maxPixelRatio))
      renderer.setClearColor(AVIARY_COLORS.background, 1)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      if (renderer.domElement.parentNode !== mount) mount.appendChild(renderer.domElement)
      pipeline = createAviaryComposer(renderer, scene, camera, tuning)

      const accent = new THREE.Color(tuning.accentColor)
      const env = buildAviaryEnvironment(world, rng, tuning, accent)
      envRoots = env.roots
      depthLayers = env.depthLayers
      perches = env.perches
      cat = env.cat
      birds = populateAviaryBirds(world, rng, tuning, perches)
      atmosphere = buildAviaryAtmosphere(stage, rng, tuning, accent)

      const clock = new THREE.Clock()

      resize = () => {
        if (disposed || !renderer || !camera || !world || !stage || !pipeline) return
        const w = Math.max(1, window.innerWidth)
        const h = Math.max(1, window.innerHeight)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        applyScrollParallaxRotation(stage, interaction.scrollSmooth, tuning.scrollRotateIntensity)
        applyBottomAnchor(camera, world, w / h, interaction.scrollSmooth, tuning.scrollDriftIntensity)
        applyWideForestCamera(camera, w / h, tuning)
        renderer.setSize(w, h, false)
        pipeline.resize(w, h)
        setLineResolution(w, h)
      }
      resize()
      requestAnimationFrame(() => resize?.())
      window.addEventListener('resize', resize)

      const animate = () => {
        if (disposed || !renderer || !scene || !camera || !world || !stage) return
        raf = requestAnimationFrame(animate)
        if (tabHiddenRef.v) return
        try {
          const delta = Math.min(clock.getDelta(), 0.05)
          const elapsed = clock.getElapsedTime()
          const rm = reducedMotionRef.current

          updateInteractionState(interaction, pointer, scrollNormRef.current, delta, tuning, rm)
          applyCameraInteraction(camera, baseCam, baseLook, interaction, tuning, rm)
          if (!rm) applyWideForestCamera(camera, camera.aspect, tuning)
          if (rm) {
            stage.rotation.set(0, 0, 0)
            stage.position.set(0, 0, 0)
          }
          else applyScrollParallaxRotation(stage, interaction.scrollSmooth, tuning.scrollRotateIntensity)
          applyBottomAnchor(camera, world, camera.aspect, interaction.scrollSmooth, tuning.scrollDriftIntensity)
          applyEnvironmentInteraction(depthLayers, interaction, tuning, rm)

          updateAviaryBirds(birds, perches, elapsed, delta, rm, rng, tuning, interaction.pointerSmooth, camera, interaction.scrollSmooth)
          cat?.tick(elapsed, delta, tuning, rm)
          if (cat && !rm) {
            const activeCat = cat
            handleCatBirdCollisions(
              activeCat.getPosition(catPosScratch),
              (target) => activeCat.pounceAt(target, elapsed),
              activeCat.isPouncing,
              birds,
              perches,
              rng,
              elapsed,
            )
          }
          atmosphere?.tick(elapsed, delta, interaction, tuning, rm)
          pipeline?.setBloomEnabled(!rm)
          pipeline?.render()
        } catch (e) {
          console.error('[OrigamiAviaryBackground] frame error', e)
          disposed = true
        }
      }
      animate()

      teardownScene = () => {
        disposed = true
        cancelAnimationFrame(raf)
        mq.removeEventListener('change', onMq)
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('scroll', onScroll)
        if (resize) window.removeEventListener('resize', resize)
        pipeline?.dispose()
        pipeline = undefined
        clearLineMaterialRegistry()
        cat?.dispose()
        cat = undefined
        atmosphere?.dispose()
        atmosphere = undefined
        if (scene) {
          disposeAviaryBirds(birds, world ?? scene)
          envRoots.forEach((r) => {
            ;(world ?? scene).remove(r)
            disposeObject3D(r)
          })
          depthLayers.forEach((l) => {
            l.position.set(0, 0, 0)
            l.rotation.set(0, 0, 0)
          })
        }
      }
    } catch (e) {
      console.error('[OrigamiAviaryBackground] init failed', e)
      mq.removeEventListener('change', onMq)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      if (resize) window.removeEventListener('resize', resize)
    }

    return () => {
      teardownScene?.()
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [])

  return (
    <div className="origami-aviary-background" aria-hidden>
      <div ref={mountRef} className="origami-aviary-background__canvas-host" />
      <div className="origami-aviary-background__readability" />
    </div>
  )
}
