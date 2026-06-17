import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { disposeLine2, isLine2Object, setLineResolution } from '../OrigamiAviaryBackground/lineBatch'
import { getAviaryViewportProfile } from '../OrigamiAviaryBackground/constants'
import {
  getLightWebGLRendererOptions,
  setAboutVineSceneActive,
  shouldUseAboutDnaWebGL,
} from '../OrigamiAviaryBackground/webglCapabilities'
import {
  readAboutVineFadeOpacity,
  readAboutVineScrollT,
} from '../OrigamiAboutBackground/homeDescentProgress'
import { ABOUT_COLORS } from '../OrigamiAboutBackground/aboutSceneConfig'
import { createMulberry32 } from '../OrigamiAviaryBackground/seededRandom'
import {
  buildVineBatPerches,
  disposeAboutDnaBats,
  populateAboutDnaBats,
  updateAboutDnaBats,
} from './aboutDnaBats'
import {
  getAboutDnaConfig,
  getSnakeVerticalHalfExtent,
  getStalkCenterX,
  getStalkVerticalBounds,
  type AboutDnaConfig,
} from './dnaConfig'
import { buildSpineSamples } from './spinePath'
import { buildAboutVinePlant, getPlantCrossSectionRadius } from './vineFoliage'
import './AboutDnaBackground.css'

const CAMERA_FOV = 38
const CAMERA_LOOK_Y = -0.52
/** Stalk center target on screen (0–1). Lower = more right-side canvas margin. */
const DESKTOP_VINE_SCREEN_X = 0.56
const NARROW_VINE_SCREEN_X = 0.52
const FRUSTUM_PAD_X = 1.05

const _fitBox = new THREE.Box3()
const _fitSize = new THREE.Vector3()
const _fitCenter = new THREE.Vector3()

function getCameraHalfHeight(cfg: AboutDnaConfig): number {
  const crossR = getPlantCrossSectionRadius(cfg)
  const base = Math.min(5.5, getSnakeVerticalHalfExtent(cfg) * 0.27)
  return base + crossR * 0.32 + cfg.branchLength * 0.28
}

function getBranchPadding(cfg: AboutDnaConfig): number {
  const crossR = getPlantCrossSectionRadius(cfg)
  return crossR * 0.85 + cfg.branchLength * 1.25
}

function computeStalkPanY(cfg: AboutDnaConfig, progress: number): number {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  const { yMin, yMax } = getStalkVerticalBounds(cfg)
  const halfH = getCameraHalfHeight(cfg)
  const viewSpan = halfH * 2
  const branchPad = getBranchPadding(cfg) * 0.2
  const endBottom = yMin - cfg.stalkPanEndBoost * 0.4
  const startBottom =
    Math.max(yMin, yMax - viewSpan + branchPad) + cfg.stalkPanStartBias
  const windowBottom = THREE.MathUtils.lerp(startBottom, endBottom, t)
  return CAMERA_LOOK_Y - halfH - windowBottom
}

function fitAboutDnaCamera(
  camera: THREE.PerspectiveCamera,
  plantRoot: THREE.Object3D,
  cfg: AboutDnaConfig,
  aspect: number,
  isNarrow: boolean,
) {
  plantRoot.updateMatrixWorld(true)
  _fitBox.setFromObject(plantRoot)

  const crossR = getPlantCrossSectionRadius(cfg)
  const scale = cfg.scaleXZ
  if (_fitBox.isEmpty()) {
    const cx = getStalkCenterX(cfg)
    const reach = (cfg.snakeSway + crossR * 2.05) * scale
    _fitBox.min.set(cx - reach, -8, -crossR * 2)
    _fitBox.max.set(cx + reach, 8, crossR * 2)
  }

  _fitBox.min.x -= FRUSTUM_PAD_X + crossR * 0.35
  _fitBox.max.x += FRUSTUM_PAD_X + crossR * 0.35

  _fitBox.getSize(_fitSize)
  _fitBox.getCenter(_fitCenter)

  const halfW = Math.max(
    _fitSize.x * 0.5,
    (cfg.stalkOffsetX + cfg.snakeSway + crossR * 2.05) * scale,
  )
  const halfH = getCameraHalfHeight(cfg)
  const fovRad = (camera.fov * Math.PI) / 180
  const halfFov = fovRad / 2
  const halfFovH = Math.atan(Math.tan(halfFov) * aspect)
  const distV = halfH / Math.tan(halfFov)
  const distH = halfW / Math.tan(halfFovH)
  let z = Math.max(distV, distH) * 1.1

  const screenX = isNarrow ? NARROW_VINE_SCREEN_X : DESKTOP_VINE_SCREEN_X
  const ndcX = screenX * 2 - 1

  for (let i = 0; i < 2; i++) {
    const halfWidth = z * Math.tan(halfFovH)
    const lookX = _fitCenter.x - ndcX * halfWidth
    const needRight = _fitBox.max.x - lookX
    const needLeft = lookX - _fitBox.min.x
    const distH2 = Math.max(needRight, needLeft) / Math.tan(halfFovH)
    z = Math.max(distV, distH, distH2) * 1.06
  }

  const halfWidth = z * Math.tan(halfFovH)
  const lookX = _fitCenter.x - ndcX * halfWidth
  camera.position.set(lookX + (_fitCenter.x - lookX) * 0.24, CAMERA_LOOK_Y, z)
  camera.lookAt(lookX, CAMERA_LOOK_Y, 0)
}

function disposeGroup(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (isLine2Object(obj)) disposeLine2(obj)
    if (obj instanceof THREE.Points) {
      obj.geometry.dispose()
      const m = obj.material
      if (Array.isArray(m)) m.forEach((mat) => mat.dispose())
      else m.dispose()
    }
  })
}

function aboutVineRegionNearViewport(): boolean {
  const region = document.getElementById('about-vine-region')
  if (!region) return false
  const rect = region.getBoundingClientRect()
  const vh = window.visualViewport?.height ?? window.innerHeight
  return rect.bottom > -vh * 0.25 && rect.top < vh * 2.35
}

function bindAboutVineVisibility(host: HTMLElement) {
  const updateVisibility = () => {
    const region = document.getElementById('about-vine-region')
    if (!region) return
    const rect = region.getBoundingClientRect()
    const vh = window.innerHeight
    const regionInView = rect.bottom > -vh * 0.08 && rect.top < vh * 1.08
    const vineFade = readAboutVineFadeOpacity()
    const show = regionInView && vineFade > 0.02
    host.classList.toggle('about-dna-background--visible', show)
    host.style.setProperty('--about-vine-opacity', String(vineFade))
    // CSS/static vine never owns the aviary GPU — keep forest rendering.
  }

  const onScroll = () => updateVisibility()

  updateVisibility()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.visualViewport?.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  return () => {
    setAboutVineSceneActive(false)
    window.removeEventListener('scroll', onScroll)
    window.visualViewport?.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}

export function AboutDnaBackground() {
  const hostRef = useRef<HTMLDivElement>(null)
  const useWebGL = shouldUseAboutDnaWebGL()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    if (!useWebGL) {
      host.classList.add('about-dna-background--static')
      return bindAboutVineVisibility(host)
    }

    let disposed = false
    let webglReady = false
    let webglTeardown: (() => void) | null = null
    let isVisible = false

    const ensureWebGL = () => {
      if (webglReady || disposed) return
      webglReady = true

      let raf = 0
      const roots: THREE.Object3D[] = []
      const clock = new THREE.Clock()

      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      let reducedMotion = mq.matches
      const onMq = () => {
        reducedMotion = mq.matches
      }
      mq.addEventListener('change', onMq)

      const tabHiddenRef = { v: document.hidden }
      const onVisibility = () => {
        tabHiddenRef.v = document.hidden
      }
      document.addEventListener('visibilitychange', onVisibility)

      const scene = new THREE.Scene()
      const cfg = getAboutDnaConfig(getAviaryViewportProfile(window.innerWidth) === 'narrow')
      const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 120)
      const world = new THREE.Group()
      scene.add(world)

      const foliageRng = createMulberry32(0x7a1ec41e)
      const spine = buildSpineSamples(cfg)
      const vine = buildAboutVinePlant(world, cfg, roots, foliageRng)

      const applyScrollDrive = () => {
        const t = readAboutVineScrollT()
        return {
          scrollPhase: t * cfg.scrollHelixTurns * Math.PI * 2,
          panY: computeStalkPanY(cfg, t),
        }
      }

      let { scrollPhase, panY } = applyScrollDrive()

      const batRng = createMulberry32(0xba71ca7e)
      const accent = new THREE.Color(ABOUT_COLORS.cyanAccent)
      const muted = new THREE.Color(ABOUT_COLORS.cyanMuted)
      const batLayer = new THREE.Group()
      batLayer.name = 'about-dna-bats'
      world.add(batLayer)
      const batPerches = buildVineBatPerches(cfg, batRng, spine)
      const bats = populateAboutDnaBats(batLayer, batRng, cfg, batPerches, accent, muted, roots)

      const viewport = document.createElement('div')
      viewport.className = 'about-dna-background__viewport'
      host.appendChild(viewport)

      const renderer = new THREE.WebGLRenderer(getLightWebGLRendererOptions())
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
      renderer.setClearColor(0x080c10, 1)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      viewport.appendChild(renderer.domElement)
      renderer.domElement.className = 'about-dna-background__canvas'

      let contextLost = false
      const onContextLost = (e: Event) => {
        e.preventDefault()
        contextLost = true
        host.classList.add('about-dna-background--static')
      }
      const onContextRestored = () => {
        contextLost = false
        host.classList.remove('about-dna-background--static')
      }
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false)

      const syncCamera = () => {
        if (disposed) return
        const narrow = getAviaryViewportProfile(window.innerWidth) === 'narrow'
        fitAboutDnaCamera(camera, world, cfg, camera.aspect, narrow)
        camera.updateProjectionMatrix()
      }

      const resize = () => {
        if (disposed) return
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        syncCamera()
        setLineResolution(w, h)
        const pr = Math.min(window.devicePixelRatio || 1, 1)
        if (vine.stalkDots?.material instanceof THREE.ShaderMaterial) {
          vine.stalkDots.material.uniforms.uPixelRatio.value = pr
        }
      }

      const animate = () => {
        if (disposed) return
        raf = requestAnimationFrame(animate)
        if (tabHiddenRef.v || contextLost || !isVisible) return
        const gl = renderer.getContext()
        if (gl.isContextLost()) return

        const delta = Math.min(clock.getDelta(), 0.05)
        const elapsed = clock.getElapsedTime()
        const drive = applyScrollDrive()
        scrollPhase = drive.scrollPhase
        panY = drive.panY

        const idleTwist = reducedMotion ? 0 : Math.sin(elapsed * 0.42) * 0.08
        vine.updatePhase(scrollPhase + idleTwist)

        const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.38) * 0.02
        world.rotation.set(0.035 + sway * 0.25, 0.06 + sway, 0.008 + sway * 0.3)
        world.position.y = panY

        updateAboutDnaBats(
          bats,
          batPerches,
          elapsed,
          delta,
          batRng,
          reducedMotion,
          cfg,
          readAboutVineFadeOpacity(),
        )

        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        setLineResolution(w, h)
        renderer.render(scene, camera)
      }

      world.position.y = panY
      resize()
      animate()

      webglTeardown = () => {
        cancelAnimationFrame(raf)
        mq.removeEventListener('change', onMq)
        document.removeEventListener('visibilitychange', onVisibility)
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
        window.removeEventListener('resize', resize)
        window.visualViewport?.removeEventListener('resize', resize)
        disposeAboutDnaBats(bats, batLayer)
        disposeGroup(world)
        renderer.dispose()
        if (renderer.domElement.parentNode === viewport) viewport.removeChild(renderer.domElement)
        if (viewport.parentNode === host) host.removeChild(viewport)
      }

      window.addEventListener('resize', resize)
      window.visualViewport?.addEventListener('resize', resize)
    }

    const updateVisibility = () => {
      const region = document.getElementById('about-vine-region')
      if (!region) return
      const rect = region.getBoundingClientRect()
      const vh = window.innerHeight
      const regionInView = rect.bottom > -vh * 0.08 && rect.top < vh * 1.08
      const vineFade = readAboutVineFadeOpacity()
      const show = regionInView && vineFade > 0.02
      isVisible = show
      host.classList.toggle('about-dna-background--visible', show)
      host.style.setProperty('--about-vine-opacity', String(vineFade))
      if (aboutVineRegionNearViewport()) ensureWebGL()
    }

    const onScroll = () => {
      updateVisibility()
    }

    updateVisibility()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.visualViewport?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      disposed = true
      setAboutVineSceneActive(false)
      webglTeardown?.()
      window.removeEventListener('scroll', onScroll)
      window.visualViewport?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [useWebGL])

  return (
    <div
      ref={hostRef}
      className={`about-dna-background${useWebGL ? '' : ' about-dna-background--static'}`}
      aria-hidden
    />
  )
}
