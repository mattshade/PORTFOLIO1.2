import type { Location } from 'react-router-dom'

export type ProjectRouteState = {
  background: Location
  scrollY: number
}

export function buildProjectRouteState(background: Location): ProjectRouteState {
  return { background, scrollY: window.scrollY }
}

export function restoreScrollPosition(scrollY: number) {
  window.scrollTo(0, scrollY)
}
