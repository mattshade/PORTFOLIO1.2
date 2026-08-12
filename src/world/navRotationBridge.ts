import {
  estimateSpinFraming,
  navSpinEase,
  navSpinFramingWeight,
  NAV_ROTATION_CONFIG,
  randomNavSpinDelta,
} from './navRotationConfig'

export type NavRotationPhase = 'idle' | 'spinning'

export type NavRotationState = {
  phase: NavRotationPhase
  rotationY: number
  progress: number
}

type Listener = (state: NavRotationState) => void

let state: NavRotationState = {
  phase: 'idle',
  rotationY: 0,
  progress: 0,
}

let spinFrom = 0
let spinDelta = 0
let spinProgress = 0
let spinFraming = { fovBoost: 0, zPull: 0 }

const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((fn) => fn(state))
}

export function getNavRotationState(): NavRotationState {
  return state
}

export function subscribeNavRotation(fn: Listener): () => void {
  listeners.add(fn)
  fn(state)
  return () => listeners.delete(fn)
}

export function getNavRotationSpinFraming() {
  return spinFraming
}

export function getNavRotationSpinProgress(): number {
  return spinProgress
}

export function isNavRotationActive(): boolean {
  return state.phase === 'spinning'
}

export function requestNavRotation(): boolean {
  spinFrom = state.rotationY
  spinDelta = randomNavSpinDelta()
  spinProgress = 0
  spinFraming = { fovBoost: 0, zPull: 0 }

  state = { ...state, phase: 'spinning', progress: 0 }
  emit()
  return true
}

export function requestNavRotationInstant(): void {
  spinFrom = state.rotationY
  spinDelta = randomNavSpinDelta()
  state = { phase: 'idle', rotationY: spinFrom + spinDelta, progress: 0 }
  spinProgress = 1
  spinFraming = { fovBoost: 0, zPull: 0 }
  emit()
}

export function prepareNavSpinFraming(forestHalfWidth: number, sceneDepth: number): void {
  spinFraming = estimateSpinFraming(spinDelta, forestHalfWidth, sceneDepth)
}

/** Advance spin from the Three.js loop — no per-frame React emits. */
export function tickNavRotation(deltaMs: number, reducedMotion: boolean): boolean {
  if (state.phase !== 'spinning') return false

  if (reducedMotion) {
    state = { phase: 'idle', rotationY: spinFrom + spinDelta, progress: 0 }
    spinFraming = { fovBoost: 0, zPull: 0 }
    emit()
    return false
  }

  spinProgress = Math.min(1, spinProgress + deltaMs / NAV_ROTATION_CONFIG.durationMs)
  const eased = navSpinEase(spinProgress)
  state = {
    ...state,
    rotationY: spinFrom + spinDelta * eased,
    progress: spinProgress,
  }

  if (spinProgress >= 1) {
    // Keep a continuous angle — never wrap here or the forest snaps on the last frame.
    state = { phase: 'idle', rotationY: spinFrom + spinDelta, progress: 0 }
    emit()
    return false
  }

  return true
}

/** Framing weight — peaks mid-spin, glides to zero through the landing tail. */
export function navRotationFramingWeight(): number {
  if (state.phase !== 'spinning') return 0
  return navSpinFramingWeight(spinProgress)
}
