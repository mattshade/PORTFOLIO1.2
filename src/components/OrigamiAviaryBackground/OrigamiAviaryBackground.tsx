import { useEffect, useRef, useState } from 'react'
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
  findCatPreyFocus,
  type AviaryBird,
} from './birdMotion'
import { captureTreeLeapStrike } from './catTreeStrike'
import { buildAviaryAtmosphere, type AtmosphereSystem } from './atmosphere'
import {
  applyBottomAnchor,
  applyScrollParallaxRotation,
  applyWideForestCamera,
  BOTTOM_ANCHOR_CAMERA,
  BOTTOM_ANCHOR_LOOK,
  scrollForestYaw,
} from './sceneAnchor'
import { clearLineMaterialRegistry, isLine2Object, disposeLine2, setLineResolution } from './lineBatch'
import { createAviaryComposer, type AviaryComposer } from './renderPipeline'
import { seedSurfaceOpacityBaselines } from '../OrigamiAboutBackground/aboutTransition'
import { applyNavRotationMotion, isNavRotationBusy } from './navRotationMotion'
import { getWebGLRendererOptions } from './webglCapabilities'
import type { OrigamiCatSystem } from './origamiCat'
import {
  buildAviaryBatPerches,
  disposeAviaryBats,
  populateAviaryBats,
  updateAviaryBats,
  type AviaryBat,
  type AviaryBatPerch,
} from './aviaryBats'

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
  const rootRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const readabilityRef = useRef<HTMLDivElement>(null)
  const reducedMotionRef = useRef(false)
  const scrollNormRef = useRef(0)
  const [webglEpoch, setWebglEpoch] = useState(0)
  const [gpuDegraded, setGpuDegraded] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let raf = 0
    let birds: AviaryBird[] = []
    let bats: AviaryBat[] = []
    let batPerches: AviaryBatPerch[] = []
    let envRoots: THREE.Object3D[] = []
    let depthLayers: THREE.Group[] = []
    let perches: ReturnType<typeof buildAviaryEnvironment>['perches'] = []
    let atmosphere: AtmosphereSystem | undefined
    let cats: OrigamiCatSystem[] = []
    let pipeline: AviaryComposer | undefined
    let scene: THREE.Scene | undefined
    let stage: THREE.Group | undefined
    let world: THREE.Group | undefined
    let spinPivot: THREE.Group | undefined
    let surfaceWorld: THREE.Group | undefined
    let camera: THREE.PerspectiveCamera | undefined
    let fog: THREE.FogExp2 | undefined

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
    let rendererForVis: THREE.WebGLRenderer | undefined
    const onVisibility = () => {
      tabHiddenRef.v = document.hidden
      if (!document.hidden && rendererForVis?.getContext().isContextLost()) {
        setWebglEpoch((n) => n + 1)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onPointer = (e: PointerEvent) => {
      const vv = window.visualViewport
      const ww = vv?.width ?? window.innerWidth
      const hh = vv?.height ?? window.innerHeight
      pointer.x = (e.clientX / Math.max(1, ww)) * 2 - 1
      pointer.y = (e.clientY / Math.max(1, hh)) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      scrollNormRef.current = window.scrollY / max
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const vvScroll = window.visualViewport
    vvScroll?.addEventListener('scroll', onScroll, { passive: true })

    let resize: (() => void) | undefined
    let teardownScene: (() => void) | null = null
    let contextLost = false
    let onContextLost: ((e: Event) => void) | undefined
    let onContextRestored: (() => void) | undefined

    try {
      const tuning = getResponsiveAviaryTuning()
      const rng = createMulberry32(tuning.seed)
      scene = new THREE.Scene()
      scene.background = new THREE.Color(AVIARY_COLORS.background)
      fog = new THREE.FogExp2(0x0c0e0c, tuning.fogDensity)
      scene.fog = fog

      stage = new THREE.Group()
      stage.name = 'aviary-stage'
      scene.add(stage)

      world = new THREE.Group()
      world.name = 'aviary-world'
      stage.add(world)

      spinPivot = new THREE.Group()
      spinPivot.name = 'aviary-nav-spin'
      world.add(spinPivot)

      surfaceWorld = new THREE.Group()
      surfaceWorld.name = 'aviary-surface'
      spinPivot.add(surfaceWorld)

      camera = new THREE.PerspectiveCamera(tuning.baseFov, 1, 0.1, 120)
      const baseCam = BOTTOM_ANCHOR_CAMERA.clone().add(
        new THREE.Vector3(tuning.cameraOffsetX, tuning.cameraOffsetY, tuning.cameraOffsetZ),
      )
      const baseLook = BOTTOM_ANCHOR_LOOK.clone()
      baseLook.y += tuning.lookAtOffsetY
      camera.position.copy(baseCam)
      camera.lookAt(baseLook)

      const renderer = new THREE.WebGLRenderer(getWebGLRendererOptions(tuning))
      rendererForVis = renderer
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tuning.maxPixelRatio))
      renderer.setClearColor(AVIARY_COLORS.background, 1)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mount.appendChild(renderer.domElement)

      const canvas = renderer.domElement
      onContextLost = (e: Event) => {
        e.preventDefault()
        contextLost = true
        setGpuDegraded(true)
      }
      onContextRestored = () => {
        contextLost = false
        setGpuDegraded(false)
        setWebglEpoch((n) => n + 1)
      }
      canvas.addEventListener('webglcontextlost', onContextLost, false)
      canvas.addEventListener('webglcontextrestored', onContextRestored, false)

      pipeline = createAviaryComposer(renderer, scene, camera, tuning)
      setGpuDegraded(false)

      const accent = new THREE.Color(tuning.accentColor)
      const muted = new THREE.Color(AVIARY_COLORS.lineMuted)
      const env = buildAviaryEnvironment(surfaceWorld, rng, tuning, accent)
      envRoots = env.roots
      depthLayers = env.depthLayers
      perches = env.perches
      cats = env.cats
      birds = populateAviaryBirds(surfaceWorld, rng, tuning, perches)
      batPerches = buildAviaryBatPerches(perches, rng, tuning)
      bats = populateAviaryBats(surfaceWorld, rng, tuning, batPerches, accent, muted, env.roots)
      atmosphere = buildAviaryAtmosphere(stage, rng, tuning, accent)
      seedSurfaceOpacityBaselines(surfaceWorld, atmosphere.glowLayer, atmosphere.arcParent)

      const clock = new THREE.Clock()

      resize = () => {
        if (disposed || !renderer || !camera || !world || !stage || !pipeline) return
        const vw = window.visualViewport
        const w = Math.max(1, Math.round(vw?.width ?? window.innerWidth))
        const h = Math.max(1, Math.round(vw?.height ?? window.innerHeight))
        renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, tuning.maxPixelRatio))
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        applyBottomAnchor(camera, world, w / h, interaction.scrollSmooth, tuning.scrollDriftIntensity)
        applyWideForestCamera(camera, w / h, tuning)
        renderer.setSize(w, h, false)
        pipeline.resize(w, h)
        setLineResolution(w, h)
      }
      resize()
      requestAnimationFrame(() => resize?.())
      window.addEventListener('resize', resize)
      const vv = window.visualViewport
      vv?.addEventListener('resize', resize)
      vv?.addEventListener('scroll', resize)

      const animate = () => {
        if (
          disposed ||
          !renderer ||
          !scene ||
          !camera ||
          !world ||
          !spinPivot ||
          !surfaceWorld ||
          !stage ||
          !fog
        )
          return
        raf = requestAnimationFrame(animate)
        if (tabHiddenRef.v || contextLost) return
        const gl = renderer.getContext()
        if (gl.isContextLost()) return
        try {
          const delta = Math.min(clock.getDelta(), 0.05)
          const elapsed = clock.getElapsedTime()
          const rm = reducedMotionRef.current
          const scrollForParallax = scrollNormRef.current

          updateInteractionState(interaction, pointer, scrollForParallax, delta, tuning, rm)
          applyCameraInteraction(camera, baseCam, baseLook, interaction, tuning, rm)
          if (!rm) applyWideForestCamera(camera, camera.aspect, tuning)

          const navBusy = isNavRotationBusy()
          if (rm || navBusy) {
            stage.rotation.set(0, 0, 0)
            stage.position.set(0, 0, 0)
          } else {
            applyScrollParallaxRotation(stage, interaction.scrollSmooth, tuning.scrollRotateIntensity)
          }

          applyBottomAnchor(camera, world, camera.aspect, scrollForParallax, tuning.scrollDriftIntensity)
          const frameBaseZ = camera.position.z
          const frameBaseFov = camera.fov
          applyNavRotationMotion(
            {
              spinPivot,
              camera,
              frameBaseZ,
              frameBaseFov,
              forestHalfWidth: tuning.forestHalfWidth,
              sceneDepth: tuning.sceneDepth,
            },
            delta * 1000,
            rm,
          )
          if (!rm) {
            spinPivot.rotation.y += scrollForestYaw(
              interaction.scrollSmooth,
              tuning.scrollForestRevolutions,
            )
          }
          applyEnvironmentInteraction(depthLayers, interaction, tuning, rm)

          updateAviaryBirds(
            birds,
            perches,
            elapsed,
            delta,
            rm,
            rng,
            tuning,
            interaction.pointerSmooth,
            camera,
            scrollForParallax,
            1,
          )
          updateAviaryBats(bats, batPerches, elapsed, delta, tuning, rng, rm)
          atmosphere?.tick(elapsed, delta, interaction, tuning, rm, 1)

          const catCtx = !rm
            ? {
                perches,
                attemptTreeLeapStrike: (pos: THREE.Vector3, out: THREE.Vector3) =>
                  captureTreeLeapStrike(pos, birds, perches, rng, elapsed, out),
                findPreyFocus: (pos: THREE.Vector3, out: THREE.Vector3) =>
                  findCatPreyFocus(birds, perches, pos, elapsed, out),
              }
            : undefined

          for (const activeCat of cats) {
            try {
              activeCat.tick(elapsed, delta, tuning, rm, catCtx)
            } catch (e) {
              console.error('[OrigamiAviaryBackground] cat tick error', e)
            }
          }

          if (!rm) {
            for (const activeCat of cats) {
              try {
                handleCatBirdCollisions(
                  activeCat.getPosition(catPosScratch),
                  (target) => activeCat.pounceAt(target, elapsed),
                  activeCat.isPouncing,
                  birds,
                  perches,
                  rng,
                  elapsed,
                  { suppress: activeCat.suppressCatBirdHandling() },
                )
              } catch (e) {
                console.error('[OrigamiAviaryBackground] cat collision error', e)
              }
            }
          }

          const bloomOn = !rm && tuning.viewportProfile !== 'narrow'
          pipeline?.setBloomStrength(bloomOn ? tuning.bloomStrength : 0)
        } catch (e) {
          console.error('[OrigamiAviaryBackground] frame error', e)
        }
        try {
          const canvasEl = renderer.domElement
          setLineResolution(
            Math.max(1, canvasEl.clientWidth || canvasEl.width),
            Math.max(1, canvasEl.clientHeight || canvasEl.height),
          )
          pipeline?.render()
        } catch (e) {
          console.error('[OrigamiAviaryBackground] render error', e)
        }
      }
      animate()

      teardownScene = () => {
        disposed = true
        cancelAnimationFrame(raf)
        if (onContextLost) canvas.removeEventListener('webglcontextlost', onContextLost)
        if (onContextRestored) canvas.removeEventListener('webglcontextrestored', onContextRestored)
        rendererForVis = undefined
        renderer.dispose()
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
        mq.removeEventListener('change', onMq)
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('scroll', onScroll)
        vvScroll?.removeEventListener('scroll', onScroll)
        if (resize) {
          window.removeEventListener('resize', resize)
          window.visualViewport?.removeEventListener('resize', resize)
          window.visualViewport?.removeEventListener('scroll', resize)
        }
        pipeline?.dispose()
        pipeline = undefined
        clearLineMaterialRegistry()
        for (const activeCat of cats) activeCat.dispose()
        cats = []
        atmosphere?.dispose()
        atmosphere = undefined
        if (scene) {
          disposeAviaryBirds(birds, world ?? scene)
          disposeAviaryBats(bats, surfaceWorld ?? world ?? scene)
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
      setGpuDegraded(true)
      mq.removeEventListener('change', onMq)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      vvScroll?.removeEventListener('scroll', onScroll)
      if (resize) {
        window.removeEventListener('resize', resize)
        window.visualViewport?.removeEventListener('resize', resize)
        window.visualViewport?.removeEventListener('scroll', resize)
      }
    }

    return () => {
      teardownScene?.()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [webglEpoch])

  return (
    <div
      ref={rootRef}
      className={`origami-aviary-background${gpuDegraded ? ' origami-aviary-background--degraded' : ''}`}
      aria-hidden
    >
      <div ref={mountRef} className="origami-aviary-background__canvas-host" />
      <div ref={readabilityRef} className="origami-aviary-background__readability" />
    </div>
  )
}
