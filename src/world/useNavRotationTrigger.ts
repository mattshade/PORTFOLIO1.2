import { useCallback } from 'react'
import { requestNavRotation, requestNavRotationInstant } from './navRotationBridge'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Call before/ alongside any primary nav action to spin the world. */
export function useNavRotationTrigger() {
  return useCallback(() => {
    if (prefersReducedMotion()) {
      requestNavRotationInstant()
      return
    }
    requestNavRotation()
  }, [])
}

/** Wrap a click handler so the world spins on every activation. */
export function useNavRotationClick<T extends (...args: never[]) => void>(handler?: T) {
  const trigger = useNavRotationTrigger()

  return useCallback(
    (...args: Parameters<T>) => {
      trigger()
      handler?.(...args)
    },
    [handler, trigger],
  ) as T
}
