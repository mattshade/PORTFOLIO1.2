import * as THREE from 'three'

export type AboutScrollJourney = {
  /** 0 = aviary, 1 = full inversion into cavern (scroll through transition band) */
  entry: number
  /** 0 = start of About vine region, 1 = footer end */
  depth: number
}

function pageScrollY(): number {
  const vv = window.visualViewport
  return (window.scrollY || document.documentElement.scrollTop) + (vv?.offsetTop ?? 0)
}

/** Document Y of an element top edge. */
function docTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + pageScrollY()
}

function docBottom(el: HTMLElement): number {
  return docTop(el) + el.offsetHeight
}

/**
 * 0 = start of inversion band, 1 = transition complete (`#about-descent-end`).
 * Uses viewport center crossing the spacer so the fade finishes as About begins.
 */
export function readAboutTransitionEntry(): number {
  const startEl = document.getElementById('about-descent-start')
  const endEl = document.getElementById('about-descent-end')
  const aboutEl = document.getElementById('about')
  const vh = window.visualViewport?.height ?? window.innerHeight
  const scrollY = pageScrollY()

  if (startEl && endEl) {
    const startTop = startEl.getBoundingClientRect().top + scrollY
    const endTop = endEl.getBoundingClientRect().top + scrollY
    const range = Math.max(vh * 0.4, endTop - startTop)
    const probe = scrollY + vh * 0.5
    return THREE.MathUtils.clamp((probe - startTop) / range, 0, 1)
  }

  if (aboutEl) {
    const aboutTop = aboutEl.getBoundingClientRect().top + scrollY
    return THREE.MathUtils.clamp(1 - (aboutTop - scrollY - vh * 0.15) / (vh * 1.35), 0, 1)
  }

  return 0
}

/**
 * Single 0→1 progress for the vine: inversion complete through bottom of footer.
 * Viewport center is the probe so twist/pan track what the reader actually sees.
 */
export function readAboutVineScrollT(): number {
  const region = document.getElementById('about-vine-region')
  const about = document.getElementById('about')
  if (!region || !about) return 0

  const vh = window.visualViewport?.height ?? window.innerHeight
  const probe = pageScrollY() + vh * 0.5

  const descentEnd = document.getElementById('about-descent-end')
  const start = descentEnd ? docTop(descentEnd) : docTop(about) - vh * 0.1

  const footer = region.querySelector<HTMLElement>('.footer')
  const regionEnd = footer ? docBottom(footer) : docBottom(region)

  const finish = regionEnd - vh * 0.22
  const travel = Math.max(vh * 4, finish - start)
  return THREE.MathUtils.clamp((probe - start) / travel, 0, 1)
}

/** Scroll-driven journey: invert into cavern, then descend through About to the footer. */
export function readAboutScrollJourney(): AboutScrollJourney {
  const entry = readAboutTransitionEntry()
  const depth = document.getElementById('about-vine-region') ? readAboutVineScrollT() : 0
  return { entry, depth }
}

/** 0 = inversion band start, 1 = footer — drives helix twist on scroll. */
export function readVineHelixTwistProgress(): number {
  return readAboutVineScrollT()
}

/** 0 = top of About vine, 1 = footer — camera pan along the stalk. */
export function readStalkPanProgress(): number {
  return readAboutVineScrollT()
}

/**
 * Vine canvas opacity: hidden during inversion, visible once the band completes or About scroll begins.
 */
export function readAboutVineFadeOpacity(): number {
  const entry = readAboutTransitionEntry()
  const scrollT = readAboutVineScrollT()

  if (entry < 0.97 && scrollT < 0.01) return 0

  const fromEntry = THREE.MathUtils.smoothstep(0.97, 1, entry)
  const fromScroll = THREE.MathUtils.smoothstep(0, 0.04, scrollT)
  return Math.min(1, Math.max(fromEntry, fromScroll, entry >= 0.97 ? 1 : 0))
}

/** @deprecated Use isAboutVineScrollActive pattern in AboutDnaBackground */
export function isAboutVineScrollActive(): boolean {
  return readAboutTransitionEntry() >= 0.97 || readAboutVineScrollT() > 0.012
}

/** @deprecated Use readStalkPanProgress */
export function readVineRegionScrollProgress(): number {
  return readStalkPanProgress()
}

/** @deprecated Use readAboutScrollJourney().entry */
export function readHomeDescentProgress(): number {
  return readAboutScrollJourney().entry
}
