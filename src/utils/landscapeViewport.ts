/** Match the CSS gate breakpoint in LandscapeGate.css */
export const LANDSCAPE_GATE_MEDIA = '(max-width: 1024px) and (orientation: portrait)'

function viewportSize(): { width: number; height: number } {
  const vv = window.visualViewport
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
  }
}

/** iPhone, iPod, iPad, and iPadOS devices that report a desktop Mac UA. */
export function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPod/i.test(ua)) return true
  if (/iPad/i.test(ua)) return true
  // iPadOS 13+ requests desktop sites
  return /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1
}

export function isAndroidTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

/** Touch-first phone/tablet — do not rely on pointer: coarse alone (Android often reports fine). */
export function isTouchMobileViewport(): boolean {
  if (typeof window === 'undefined') return false

  if (isAppleTouchDevice() || isAndroidTouchDevice()) {
    const { width, height } = viewportSize()
    const minSide = Math.min(width, height)
    // Phones + tablets; skip desktop-class iPad external displays.
    return minSide <= 1024
  }

  const { width } = viewportSize()
  const maxTouch = navigator.maxTouchPoints > 0
  const narrow = width <= 900
  const touchPrimary =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches ||
    (maxTouch > 0 && narrow)

  return narrow && touchPrimary
}

export function isPortraitViewport(): boolean {
  if (typeof window === 'undefined') return false

  if (window.matchMedia('(orientation: portrait)').matches) return true

  const orientation = screen.orientation
  if (orientation?.type) {
    return orientation.type.startsWith('portrait')
  }

  if (typeof window.orientation === 'number') {
    const o = Math.abs(window.orientation)
    return o !== 90
  }

  const { width, height } = viewportSize()
  return height > width * 1.02
}

/** Whether the rotate prompt should block interaction. */
export function shouldShowLandscapeGate(): boolean {
  if (typeof window === 'undefined') return false
  return isTouchMobileViewport() && isPortraitViewport()
}

/** Apply once so CSS can target touch devices before React paints. */
export function markTouchMobileDocument(): void {
  if (typeof document === 'undefined') return
  if (isTouchMobileViewport()) {
    document.documentElement.classList.add('touch-mobile')
  }
}

export function subscribeLandscapeGate(callback: () => void): () => void {
  markTouchMobileDocument()

  const run = () => callback()
  const schedule = () => {
    run()
    window.requestAnimationFrame(run)
    window.setTimeout(run, 100)
    window.setTimeout(run, 350)
  }

  const portraitMq = window.matchMedia('(orientation: portrait)')
  const gateMq = window.matchMedia(LANDSCAPE_GATE_MEDIA)

  window.addEventListener('resize', schedule)
  window.addEventListener('orientationchange', schedule)
  window.visualViewport?.addEventListener('resize', schedule)
  window.visualViewport?.addEventListener('scroll', schedule)
  portraitMq.addEventListener('change', schedule)
  gateMq.addEventListener('change', schedule)
  screen.orientation?.addEventListener('change', schedule)

  run()

  return () => {
    window.removeEventListener('resize', schedule)
    window.removeEventListener('orientationchange', schedule)
    window.visualViewport?.removeEventListener('resize', schedule)
    window.visualViewport?.removeEventListener('scroll', schedule)
    portraitMq.removeEventListener('change', schedule)
    gateMq.removeEventListener('change', schedule)
    screen.orientation?.removeEventListener('change', schedule)
  }
}
