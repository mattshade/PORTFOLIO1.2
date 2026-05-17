import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { OrigamiAviaryTuning } from './constants'

export type AviaryComposer = {
  composer: EffectComposer
  bloomPass: UnrealBloomPass
  resize: (width: number, height: number) => void
  render: () => void
  setBloomEnabled: (enabled: boolean) => void
  setBloomStrength: (strength: number) => void
  dispose: () => void
}

export function createAviaryComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  tuning: OrigamiAviaryTuning,
): AviaryComposer {
  renderer.toneMapping = THREE.NoToneMapping

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    tuning.bloomStrength,
    tuning.bloomRadius,
    tuning.bloomThreshold,
  )
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())

  const resize = (width: number, height: number) => {
    composer.setSize(width, height)
    bloomPass.resolution.set(width, height)
  }

  const setBloomEnabled = (enabled: boolean) => {
    bloomPass.enabled = enabled
    bloomPass.strength = enabled ? tuning.bloomStrength : 0
  }

  const setBloomStrength = (strength: number) => {
    bloomPass.enabled = strength > 0.001
    bloomPass.strength = strength
  }

  return {
    composer,
    bloomPass,
    resize,
    render: () => composer.render(),
    setBloomEnabled,
    setBloomStrength,
    dispose: () => composer.dispose(),
  }
}
