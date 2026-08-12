import { useEffect, useState } from 'react'
import './LandscapeGate.css'

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 900px) and (pointer: coarse)').matches
}

function isPortraitViewport(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(orientation: portrait)').matches) return true
  const vv = window.visualViewport
  const w = vv?.width ?? window.innerWidth
  const h = vv?.height ?? window.innerHeight
  return h > w * 1.02
}

async function tryLockLandscape(): Promise<void> {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: OrientationLockType) => Promise<void>
  }
  if (!orientation?.lock) return
  try {
    await orientation.lock('landscape')
  } catch {
    // Expected in mobile Safari and most in-tab browsers.
  }
}

export function LandscapeGate() {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const sync = () => {
      const shouldBlock = isMobileViewport() && isPortraitViewport()
      setBlocked(shouldBlock)
      document.documentElement.classList.toggle('landscape-gate-active', shouldBlock)
      if (shouldBlock) void tryLockLandscape()
    }

    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    window.visualViewport?.addEventListener('resize', sync)

    return () => {
      document.documentElement.classList.remove('landscape-gate-active')
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.visualViewport?.removeEventListener('resize', sync)
    }
  }, [])

  if (!blocked) return null

  return (
    <div className="landscape-gate" role="dialog" aria-modal="true" aria-label="Rotate your device">
      <div className="landscape-gate__panel">
        <div className="landscape-gate__icon" aria-hidden>
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="10" width="26" height="44" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M44 32h10m0 0-4-4m4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="48" y="22" width="14" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </div>
        <p className="landscape-gate__title">Rotate for the full forest</p>
        <p className="landscape-gate__body">This portfolio is built for landscape on phones and tablets.</p>
      </div>
    </div>
  )
}
