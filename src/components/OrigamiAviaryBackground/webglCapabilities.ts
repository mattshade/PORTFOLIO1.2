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

export function getWebGLRendererOptions(tuning: OrigamiAviaryTuning): WebGLRendererParameters {
  const light = isFragileWebGLDevice() || tuning.viewportProfile === 'narrow'
  return {
    antialias: !light,
    alpha: false,
    powerPreference: light ? 'default' : 'high-performance',
    stencil: false,
  }
}

/** Post-processing framebuffers are a common cause of context loss on mobile GPUs. */
export function shouldUseAviaryPostProcessing(tuning: OrigamiAviaryTuning): boolean {
  if (isFragileWebGLDevice()) return false
  return tuning.viewportProfile !== 'narrow' && tuning.bloomStrength > 0.02
}
