import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    if (pathname.startsWith('/project/')) {
      prevPathRef.current = pathname
      return
    }

    const prevPath = prevPathRef.current
    prevPathRef.current = pathname
    const returningFromProject = prevPath.startsWith('/project/')

    if (!hash) {
      if (returningFromProject) return
      window.scrollTo(0, 0)
      return
    }

    const id = hash.replace('#', '')
    let attempts = 0
    const maxAttempts = 120
    const poll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
      if (++attempts < maxAttempts) {
        requestAnimationFrame(poll)
      }
    }
    requestAnimationFrame(poll)
  }, [pathname, hash])

  return null
}
