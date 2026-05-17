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
import { computeStalkPanY } from './aboutVineEmbed'
import {
  getAboutDnaConfig,
  getSnakeVerticalHalfExtent,
  getStalkCenterX,
  type AboutDnaConfig,
} from './dnaConfig'
import { buildSpineSamples } from './spinePath'
import { buildAboutVinePlant, getPlantCrossSectionRadius } from './vineFoliage'
import './AboutDnaBackground.css'

const CAMERA_FOV = 38
const CAMERA_LOOK_Y = -0.38

function getCameraHalfHeight(cfg: AboutDnaConfig): number {
  return Math.min(4.25, getSnakeVerticalHalfExtent(cfg) * 0.21)
}

function fitAboutDnaCamera(
  camera: THREE.PerspectiveCamera,
  cfg: AboutDnaConfig,
  aspect: number,
) {
  const centerX = getStalkCenterX(cfg)
  const extentX =
    (cfg.stalkOffsetX + cfg.snakeSway + getPlantCrossSectionRadius(cfg) * 1.15) * cfg.scaleXZ
  const halfH = getCameraHalfHeight(cfg)
  const fovRad = (camera.fov * Math.PI) / 180
  const halfFov = fovRad / 2
  const distV = halfH / Math.tan(halfFov)
  const halfFovH = Math.atan(Math.tan(halfFov) * aspect)
  const distH = extentX / Math.tan(halfFovH)
  const z = Math.max(distV, distH) * 1.06 + cfg.cameraPadding
  camera.position.set(centerX * 0.72, -0.04, z)
  camera.lookAt(centerX, CAMERA_LOOK_Y, 0)
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

function bindAboutVineVisibility(host: HTMLElement) {
  const updateVisibility = () => {
    const region = document.getElementById('about-vine-region')
    if (!region) return
    const rect = region.getBoundingClientRect()
    const vh = window.innerHeight
    const regionInView = rect.bottom > 0 && rect.top < vh * 1.02
    const vineFade = readAboutVineFadeOpacity()
    const show = regionInView && vineFade > 0.02
    host.classList.toggle('about-dna-background--visible', show)
    host.style.setProperty('--about-vine-opacity', String(vineFade))
    setAboutVineSceneActive(show)
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
    let raf = 0
    let isVisible = false
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
    const cfg = getAboutDnaConfig(
      getAviaryViewportProfile(window.innerWidth) === 'narrow' ? 'mobile' : 'desktop',
    )
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

    const renderer = new THREE.WebGLRenderer(getLightWebGLRendererOptions())
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
    renderer.setClearColor(0x080c10, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)
    renderer.domElement.className = 'about-dna-background__canvas'

    let contextLost = false
    const onContextLost = (e: Event) => {
      e.preventDefault()
      contextLost = true
      setAboutVineSceneActive(false)
      host.classList.add('about-dna-background--static')
    }
    const onContextRestored = () => {
      contextLost = false
      host.classList.remove('about-dna-background--static')
    }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false)

    const resize = () => {
      if (disposed) return
      const w = Math.max(1, host.clientWidth)
      const h = Math.max(1, host.clientHeight)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      fitAboutDnaCamera(camera, cfg, w / h)
      camera.updateProjectionMatrix()
      setLineResolution(w, h)
      const pr = Math.min(window.devicePixelRatio || 1, 1)
      if (vine.stalkDots?.material instanceof THREE.ShaderMaterial) {
        vine.stalkDots.material.uniforms.uPixelRatio.value = pr
      }
    }

    const updateVisibility = () => {
      const region = document.getElementById('about-vine-region')
      if (!region) return
      const rect = region.getBoundingClientRect()
      const vh = window.innerHeight
      const regionInView = rect.bottom > 0 && rect.top < vh * 1.02
      const vineFade = readAboutVineFadeOpacity()
      const show = regionInView && vineFade > 0.02
      isVisible = show
      host.classList.toggle('about-dna-background--visible', show)
      host.style.setProperty('--about-vine-opacity', String(vineFade))
      setAboutVineSceneActive(show && !contextLost)
    }

    const onScroll = () => {
      const drive = applyScrollDrive()
      scrollPhase = drive.scrollPhase
      panY = drive.panY
      updateVisibility()
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

      const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.38) * 0.035
      world.rotation.set(0.1 + sway * 0.4, 0.14 + sway, 0.02 + sway * 0.5)
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

      renderer.render(scene, camera)
    }

    resize()
    updateVisibility()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.visualViewport?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', onMq)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
      window.visualViewport?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
      setAboutVineSceneActive(false)
      disposeAboutDnaBats(bats, batLayer)
      disposeGroup(world)
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
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
