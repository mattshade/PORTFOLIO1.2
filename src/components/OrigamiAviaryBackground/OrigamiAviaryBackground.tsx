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
  type AviaryBird,
} from './birdMotion'
import { captureTreeLeapStrike } from './catTreeStrike'
import { buildAviaryAtmosphere, type AtmosphereSystem } from './atmosphere'
import {
  applyBottomAnchor,
  applyWideForestCamera,
  BOTTOM_ANCHOR_CAMERA,
  BOTTOM_ANCHOR_LOOK,
  scrollParallaxDrive,
} from './sceneAnchor'
import { clearLineMaterialRegistry, isLine2Object, disposeLine2, setLineResolution } from './lineBatch'
import { createAviaryComposer, type AviaryComposer } from './renderPipeline'
import { getAboutSceneProfile, type AboutSceneProfile } from '../OrigamiAboutBackground/aboutSceneConfig'
import { buildCavernLayer } from '../OrigamiAboutBackground/aboutEnvironment'
import {
  applyAboutScrollTransition,
  applyAboutSurfaceFade,
  applyCavernDepthEffects,
  seedSurfaceOpacityBaselines,
  applyCavernInversionMotion,
} from '../OrigamiAboutBackground/aboutTransition'
import type { CavernAtmosphereSystem } from '../OrigamiAboutBackground/cavernAtmosphere'
import { readAboutScrollJourney } from '../OrigamiAboutBackground/homeDescentProgress'
import {
  getWebGLRendererOptions,
  shouldBuildAviaryCavern,
  shouldPauseAviaryWhileAboutVine,
  shouldUseAboutCavernInversion,
} from './webglCapabilities'
import {
  disposeAboutBats,
  populateAboutBats,
  updateAboutBats,
  type AboutBat,
} from '../OrigamiAboutBackground/batMotion'

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
  const journeyRef = useRef({ entry: 0, depth: 0 })
  const journeySmoothRef = useRef({ entry: 0, depth: 0 })
  const [webglEpoch, setWebglEpoch] = useState(0)
  const [gpuDegraded, setGpuDegraded] = useState(false)

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
    let surfaceWorld: THREE.Group | undefined
    let camera: THREE.PerspectiveCamera | undefined
    let fog: THREE.FogExp2 | undefined
    let cavern: THREE.Group | undefined
    let bats: AboutBat[] = []
    let batPerches: ReturnType<typeof buildCavernLayer>['batPerches'] = []
    let cavernAtmosphere: CavernAtmosphereSystem | undefined
    let aboutProfile: AboutSceneProfile = getAboutSceneProfile(window.innerWidth)
    let journeySmooth = { entry: 0, depth: 0 }

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
      journeyRef.current = readAboutScrollJourney()
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
      aboutProfile = getAboutSceneProfile(window.innerWidth)
      aboutProfile.upper.fogDensity = tuning.fogDensity

      stage = new THREE.Group()
      stage.name = 'aviary-stage'
      scene.add(stage)

      world = new THREE.Group()
      world.name = 'aviary-world'
      stage.add(world)

      surfaceWorld = new THREE.Group()
      surfaceWorld.name = 'aviary-surface'
      world.add(surfaceWorld)

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
      const env = buildAviaryEnvironment(surfaceWorld, rng, tuning, accent)
      envRoots = env.roots
      depthLayers = env.depthLayers
      perches = env.perches
      cat = env.cat
      birds = populateAviaryBirds(surfaceWorld, rng, tuning, perches)
      atmosphere = buildAviaryAtmosphere(stage, rng, tuning, accent)
      seedSurfaceOpacityBaselines(surfaceWorld, atmosphere.glowLayer, atmosphere.arcParent)

      if (shouldBuildAviaryCavern()) {
        const cavernRng = createMulberry32(0xab0f4e75)
        const cavernLayer = buildCavernLayer(world, cavernRng, aboutProfile, tuning.sceneDepth, envRoots)
        cavern = cavernLayer.cavern
        batPerches = cavernLayer.batPerches
        cavernAtmosphere = cavernLayer.cavernAtmosphere
        const cyan = new THREE.Color(aboutProfile.cavern.accentColor)
        const cyanMuted = new THREE.Color(0x3d6a78)
        bats = populateAboutBats(
          cavern,
          cavernRng,
          batPerches,
          aboutProfile.cavern,
          cyan,
          cyanMuted,
          tuning.sceneDepth,
          envRoots,
        )
      } else {
        cavern = new THREE.Group()
        cavern.name = 'about-cavern-empty'
        cavern.visible = false
        world.add(cavern)
      }

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
        if (disposed || !renderer || !scene || !camera || !world || !surfaceWorld || !stage || !fog || !cavern)
          return
        raf = requestAnimationFrame(animate)
        if (tabHiddenRef.v || contextLost) return
        const gl = renderer.getContext()
        if (gl.isContextLost()) return
        const aboutVinePause = shouldPauseAviaryWhileAboutVine()
        try {
          const delta = Math.min(clock.getDelta(), 0.05)
          const elapsed = clock.getElapsedTime()
          const rm = reducedMotionRef.current
          const journeyTarget = journeyRef.current
          const smoothRate = rm ? 1 : 1 - Math.exp(-delta * 6)
          journeySmooth.entry += (journeyTarget.entry - journeySmooth.entry) * smoothRate
          journeySmooth.depth += (journeyTarget.depth - journeySmooth.depth) * smoothRate
          journeySmoothRef.current = { ...journeySmooth }

          const { entry, depth } = journeySmooth
          const scrollEntry = journeyTarget.entry
          const surfaceLayers: THREE.Object3D[] = []
          if (atmosphere) {
            surfaceLayers.push(atmosphere.glowLayer, atmosphere.arcParent)
          }

          const transitionTargets = {
            surfaceWorld,
            cavern,
            scene,
            fog,
            renderer,
            birds,
            bats,
            surfaceLayers,
            cat: cat ?? null,
            readabilityEl: readabilityRef.current,
            upperFogDensity: tuning.fogDensity,
          }

          const { t: entryT, revealCavern, surfaceVis } = applyAboutScrollTransition(
            scrollEntry,
            aboutProfile,
            transitionTargets,
          )
          const cavernMix = applyCavernDepthEffects(
            depth,
            scrollEntry,
            revealCavern,
            surfaceVis,
            aboutProfile,
            transitionTargets,
          )

          const scrollForParallax = scrollNormRef.current * (1 - entryT * 0.65 - depth * 0.25)

          updateInteractionState(interaction, pointer, scrollForParallax, delta, tuning, rm)
          applyCameraInteraction(camera, baseCam, baseLook, interaction, tuning, rm)
          const { transition: tr, descent: d } = aboutProfile
          const inv = entryT
          camera.position.y += inv * tr.cameraDriftY + depth * d.cameraDepthY
          camera.position.z += inv * tr.cameraDriftZ + depth * d.cameraDepthZ
          if (!rm) applyWideForestCamera(camera, camera.aspect, tuning)
          if (rm) {
            stage.rotation.set(0, 0, 0)
            stage.position.set(0, 0, 0)
          } else if (shouldUseAboutCavernInversion()) {
            applyCavernInversionMotion(
              stage,
              interaction.scrollSmooth,
              aboutProfile.scrollRotateIntensity,
              entry,
              depth,
              aboutProfile,
            )
          } else {
            const drive = scrollParallaxDrive(interaction.scrollSmooth)
            const ri = aboutProfile.scrollRotateIntensity * 0.22
            stage.rotation.x = drive * ri * 0.35
            stage.rotation.y = drive * ri * 0.5
            stage.rotation.z = drive * ri * 0.12
            stage.position.y = drive * ri * 0.06
            stage.position.z = drive * ri * 0.14
          }
          applyBottomAnchor(camera, world, camera.aspect, scrollForParallax, tuning.scrollDriftIntensity)
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
            surfaceVis,
          )
          updateAboutBats(bats, batPerches, elapsed, delta, aboutProfile.cavern, cavernRng, rm, depth)
          cavernAtmosphere?.tick(
            elapsed,
            THREE.MathUtils.smoothstep(cavernMix, 0.25, 0.95),
            rm,
          )
          atmosphere?.tick(elapsed, delta, interaction, tuning, rm, surfaceVis)
          cat?.tick(
            elapsed,
            delta,
            tuning,
            rm,
            cat && !rm
              ? {
                  perches,
                  attemptTreeLeapStrike: (pos, out) => captureTreeLeapStrike(pos, birds, perches, rng, elapsed, out),
                }
              : undefined,
          )
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
              { suppress: activeCat.suppressCatBirdHandling() },
            )
          }
          applyAboutSurfaceFade(transitionTargets, surfaceVis)
          if (aboutVinePause) return
          const bloomOn = !rm && tuning.viewportProfile !== 'narrow'
          pipeline?.setBloomStrength(bloomOn ? tuning.bloomStrength * surfaceVis : 0)
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
        cat?.dispose()
        cat = undefined
        atmosphere?.dispose()
        atmosphere = undefined
        cavernAtmosphere?.dispose()
        cavernAtmosphere = undefined
        if (scene) {
          if (cavern) disposeAboutBats(bats, cavern)
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
