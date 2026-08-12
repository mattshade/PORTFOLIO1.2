import { useCallback } from 'react'
import { requestAboutNavDescent, requestAboutNavDescentInstant } from './aboutJourneyBridge'
import { requestNavRotation, requestNavRotationInstant } from './navRotationBridge'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Forest spin plus choreographed descent into the About cavern. */
export function useAboutNavTrigger() {
  return useCallback((e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.()

    if (prefersReducedMotion()) {
      requestNavRotationInstant()
      requestAboutNavDescentInstant()
      return
    }

    requestNavRotation()
    requestAboutNavDescent()
  }, [])
}
