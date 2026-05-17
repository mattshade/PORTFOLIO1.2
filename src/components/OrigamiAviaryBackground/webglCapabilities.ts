import type { WebGLRendererParameters } from 'three'
import type { OrigamiAviaryTuning } from './constants'

/** Touch-first layouts and Android Chrome are prone to GPU context loss. */
export function isFragileWebGLDevice(): boolean {
  if (typeof window === 'undefined') return false
  const w = window.innerWidth
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const android = /Android/i.test(navigator.userAgent)
  return w <= 768 || coarse || android
}

/** Second WebGL canvas (About DNA vine) — skip on fragile devices; use CSS fallback. */
export function shouldUseAboutDnaWebGL(): boolean {
  return !isFragileWebGLDevice()
}

/** Heavy cavern geometry in the main aviary — skip on fragile devices. */
export function shouldBuildAviaryCavern(): boolean {
  return !isFragileWebGLDevice()
}

/** Full stage inversion during About descent — too heavy for mobile GPUs. */
export function shouldUseAboutCavernInversion(): boolean {
  return !isFragileWebGLDevice()
}

let aboutVineSceneActive = false

/** True while the About DNA canvas is visible and rendering (main aviary should pause). */
export function setAboutVineSceneActive(active: boolean): void {
  aboutVineSceneActive = active
}

export function shouldPauseAviaryWhileAboutVine(): boolean {
  return aboutVineSceneActive
}

function lightWebGLRendererOptions(forceLight?: boolean): WebGLRendererParameters {
  const light = forceLight ?? isFragileWebGLDevice()
  return {
    antialias: !light,
    alpha: false,
    powerPreference: light ? 'default' : 'high-performance',
    stencil: false,
  }
}

export function getWebGLRendererOptions(tuning: OrigamiAviaryTuning): WebGLRendererParameters {
  return lightWebGLRendererOptions(isFragileWebGLDevice() || tuning.viewportProfile === 'narrow')
}

export function getLightWebGLRendererOptions(): WebGLRendererParameters {
  return lightWebGLRendererOptions()
}

/** Post-processing framebuffers are a common cause of context loss on mobile GPUs. */
export function shouldUseAviaryPostProcessing(tuning: OrigamiAviaryTuning): boolean {
  if (isFragileWebGLDevice()) return false
  return tuning.viewportProfile !== 'narrow' && tuning.bloomStrength > 0.02
}
