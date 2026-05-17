import type { WebGLRendererParameters } from 'three'
import type { OrigamiAviaryTuning } from './constants'

/** Touch-first layouts and Android Chrome are prone to GPU context loss. */
export function isFragileWebGLDevice(): boolean {
  if (typeof window === 'undefined') return false
  const w = window.innerWidth
  if (/Android/i.test(navigator.userAgent)) return true
  if (w <= 768) return true
  // Coarse pointer on tablet-sized viewports only — not touch-screen desktops.
  if (w <= 1100 && window.matchMedia('(pointer: coarse)').matches) return true
  return false
}

/** Second WebGL canvas (About DNA vine) — desktop/tablet only; fragile uses embed in aviary. */
export function shouldUseAboutDnaWebGL(): boolean {
  return !isFragileWebGLDevice()
}

/** Mobile uses SVG static art in AboutDnaBackground instead of aviary embed. */
export function shouldUseEmbeddedAboutVine(): boolean {
  return false
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

/** @deprecated Aviary must keep rendering during About (cavern transition + embed vine). */
export function shouldPauseAviaryWhileAboutVine(): boolean {
  return false
}

/** Dedicated About DNA overlay canvas (desktop / tablet) — transparent over the aviary. */
export function getAboutDnaWebGLRendererOptions(): WebGLRendererParameters {
  return {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
  }
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
