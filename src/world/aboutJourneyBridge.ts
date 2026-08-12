import { navSpinEase } from './navRotationConfig'

type DescentPhase = 'idle' | 'waiting' | 'scrolling' | 'complete'

const WAIT_MS = 380
const SCROLL_MS = 2400

let phase: DescentPhase = 'idle'
let waitStart = 0
let scrollFrom = 0
let scrollTo = 0
let scrollStart = 0
let choreoEntry = 0
let programmaticScroll = false
let listenersAttached = false

function pageScrollY(): number {
  const vv = window.visualViewport
  return (window.scrollY || document.documentElement.scrollTop) + (vv?.offsetTop ?? 0)
}

/** Scroll position where the inversion band completes (entry ≈ 1). */
export function computeAboutDescentScrollY(): number {
  const startEl = document.getElementById('about-descent-start')
  const endEl = document.getElementById('about-descent-end')
  const aboutEl = document.getElementById('about')
  const vh = window.visualViewport?.height ?? window.innerHeight
  const scrollY = pageScrollY()

  if (startEl && endEl) {
    const startTop = startEl.getBoundingClientRect().top + scrollY
    const endTop = endEl.getBoundingClientRect().top + scrollY
    const range = Math.max(vh * 0.4, endTop - startTop)
    const transitionEndScroll = startTop + range - vh * 0.5

    if (aboutEl) {
      const aboutTop = aboutEl.getBoundingClientRect().top + scrollY
      const aboutTarget = aboutTop - vh * 0.14
      return Math.max(transitionEndScroll, aboutTarget)
    }
    return transitionEndScroll
  }

  if (aboutEl) {
    const aboutTop = aboutEl.getBoundingClientRect().top + scrollY
    return aboutTop - vh * 0.14
  }

  return scrollY
}

function finishDescent() {
  phase = 'complete'
  choreoEntry = 0
  programmaticScroll = false
  window.setTimeout(() => {
    if (phase === 'complete') phase = 'idle'
  }, 120)
}

function cancelAboutNavDescent() {
  if (phase === 'idle') return
  phase = 'idle'
  choreoEntry = 0
  programmaticScroll = false
}

function onUserScrollIntent() {
  if (programmaticScroll || phase !== 'scrolling') return
  cancelAboutNavDescent()
}

function ensureListeners() {
  if (listenersAttached || typeof window === 'undefined') return
  listenersAttached = true
  window.addEventListener('wheel', onUserScrollIntent, { passive: true })
  window.addEventListener('touchstart', onUserScrollIntent, { passive: true })
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
      onUserScrollIntent()
    }
  })
}

function updateChoreoEntry(now: number) {
  if (phase === 'idle' || phase === 'complete') {
    choreoEntry = 0
    return
  }

  if (phase === 'waiting') {
    const t = Math.min(1, (now - waitStart) / WAIT_MS)
    choreoEntry = navSpinEase(t) * 0.2
    return
  }

  if (phase === 'scrolling') {
    const t = Math.min(1, (now - scrollStart) / SCROLL_MS)
    choreoEntry = 0.2 + navSpinEase(t) * 0.8
  }
}

/** Synthetic entry progress during nav-driven descent (merged with scroll entry in the scene). */
export function getAboutNavChoreoEntry(): number {
  return choreoEntry
}

export function isAboutNavDescentActive(): boolean {
  return phase === 'waiting' || phase === 'scrolling'
}

/** Spin has started — queue smooth scroll through the inversion band into About. */
export function requestAboutNavDescent(): boolean {
  if (typeof window === 'undefined') return false
  ensureListeners()

  const target = computeAboutDescentScrollY()
  const from = pageScrollY()

  if (Math.abs(target - from) < 8) {
    finishDescent()
    return false
  }

  phase = 'waiting'
  waitStart = performance.now()
  scrollFrom = from
  scrollTo = target
  choreoEntry = 0
  return true
}

export function requestAboutNavDescentInstant(): void {
  if (typeof window === 'undefined') return
  window.scrollTo(0, computeAboutDescentScrollY())
  finishDescent()
}

/** Advance choreographed scroll — call from the aviary animation loop. */
export function tickAboutNavDescent(now: number): boolean {
  updateChoreoEntry(now)

  if (phase === 'waiting') {
    if (now - waitStart >= WAIT_MS) {
      phase = 'scrolling'
      scrollStart = now
    }
    return true
  }

  if (phase === 'scrolling') {
    const t = Math.min(1, (now - scrollStart) / SCROLL_MS)
    const eased = navSpinEase(t)
    programmaticScroll = true
    window.scrollTo(0, scrollFrom + (scrollTo - scrollFrom) * eased)
    programmaticScroll = false

    if (t >= 1) {
      finishDescent()
      return false
    }
    return true
  }

  return false
}
