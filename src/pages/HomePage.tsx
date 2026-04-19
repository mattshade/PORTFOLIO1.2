import { useState, useEffect } from 'react'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { Footer } from '../components/Footer'
import { SystemBoids } from '../components/SystemBoids'
import { BackToTop } from '../components/BackToTop'


export function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [birdsReady, setBirdsReady] = useState(false)

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
          <Hero />
          <Bio />
          <Projects />
          <Experience />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  )
}
