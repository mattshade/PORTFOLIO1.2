import { useEffect, useState } from 'react'
import { Nav } from '../components/Nav'
import { Resume } from '../components/Resume'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'
import { SystemBoids } from '../components/SystemBoids'

export function ResumePage() {
  const [scrollY, setScrollY] = useState(0)
  const [birdsReady, setBirdsReady] = useState(false)

  useEffect(() => {
    const prev = document.title
    document.title = 'Matt Shade — Resume'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBirdsReady(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <div className="birds-bg" aria-hidden>
        {birdsReady && <SystemBoids scrollY={scrollY} />}
      </div>
      <div className="app-content">
        <Nav />
        <main id="main-content">
          <Resume />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  )
}
