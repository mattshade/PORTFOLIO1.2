import { useEffect, useState } from 'react'
import {
  isAndroidTouchDevice,
  markTouchMobileDocument,
  shouldShowLandscapeGate,
  subscribeLandscapeGate,
} from '../utils/landscapeViewport'
import './LandscapeGate.css'

async function tryLockLandscape(): Promise<void> {
  // Orientation lock is supported on some Android PWAs; iOS Safari blocks it in-tab.
  if (!isAndroidTouchDevice()) return

  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: OrientationLockType) => Promise<void>
  }
  if (!orientation?.lock) return
  try {
    await orientation.lock('landscape')
  } catch {
    // Expected in most in-browser views.
  }
}

export function LandscapeGate() {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    markTouchMobileDocument()
    return subscribeLandscapeGate(() => {
      const shouldBlock = shouldShowLandscapeGate()
      setBlocked(shouldBlock)
      document.documentElement.classList.toggle('landscape-gate-active', shouldBlock)
      if (shouldBlock) void tryLockLandscape()
    })
  }, [])

  return (
    <div
      className={`landscape-gate${blocked ? ' landscape-gate--active' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={blocked ? 'false' : 'true'}
      aria-label="Rotate your device"
    >
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
        <p className="landscape-gate__body">Turn your phone or tablet sideways to explore the portfolio.</p>
      </div>
    </div>
  )
}
