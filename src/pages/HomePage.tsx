import { useState, useEffect, useCallback } from 'react'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { Footer } from '../components/Footer'
import { BirdsFly } from '../components/BirdsFly'

export function HomePage() {
  const [mouseX, setMouseX] = useState(0.5)
  const [mouseY, setMouseY] = useState(0.5)
  const [isHovering, setIsHovering] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [birdsReady, setBirdsReady] = useState(false)
  const [landingTarget, setLandingTarget] = useState<DOMRect | null>(null)

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

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    setMouseX(e.clientX / window.innerWidth)
    setMouseY(e.clientY / window.innerHeight)
    setIsHovering(true)
  }, [])

  const handleMouseOut = useCallback((e: globalThis.MouseEvent) => {
    if (e.relatedTarget === null) setIsHovering(false)
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseout', handleMouseOut)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [handleMouseMove, handleMouseOut])

  return (
    <>
      <div className="birds-bg" aria-hidden>
        {birdsReady && <BirdsFly mouseX={mouseX} mouseY={mouseY} isHovering={isHovering} scrollY={scrollY} landingTarget={landingTarget} />}
      </div>
      <div className="app-content">
        <Nav />
        <main>
          <Hero />
          <Bio />
          <Projects onCardReading={setLandingTarget} />
          <Experience />
        </main>
        <Footer />
      </div>
    </>
  )
}
