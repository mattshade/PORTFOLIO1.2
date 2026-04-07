import { useState, useCallback, MouseEvent } from 'react'
import { resume } from '../data/resume'
import { SayHiBubble } from './SayHiBubble'
import './Hero.css'

export function Hero() {
  const [mouseX, setMouseX] = useState(0.5)
  const [mouseY, setMouseY] = useState(0.5)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    setMouseX((e.clientX - rect.left) / rect.width)
    setMouseY((e.clientY - rect.top) / rect.height)
  }, [])

  return (
    <section 
      className="hero" 
      aria-label="Introduction"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={
        isHovering
          ? {
              ['--cursor-x' as string]: mouseX,
              ['--cursor-y' as string]: mouseY,
            }
          : undefined
      }
    >
      <div className="hero-bg">
        <div className="hero-cursor-glow" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="hero-glow hero-glow-1" aria-hidden />
        <div className="hero-glow hero-glow-2" aria-hidden />
        <div className="hero-glow hero-glow-3" aria-hidden />
        <div className="hero-gradient" aria-hidden />
      </div>
      <div className="hero-content">
        <p className="hero-eyebrow" style={{ animationDelay: '0ms' }}>
          {resume.title}
        </p>
        <h1 className="hero-title">
          <span className="hero-name" style={{ animationDelay: '80ms' }}>{resume.name}</span>
        </h1>
        <p className="hero-tagline" style={{ animationDelay: '160ms' }}>
          Technology and design leader with 18+ years at{' '}
          <span className="hero-tagline-highlight">NBCUniversal</span> and{' '}
          <span className="hero-tagline-highlight">CNBC</span>, building and scaling{' '}
          <span className="hero-tagline-highlight">AI-powered</span> products and teams
          that turn complexity into clarity.
        </p>
        <div className="hero-ctas" style={{ animationDelay: '240ms' }}>
          <a href="#projects" className="hero-cta hero-cta-primary">
            View projects
          </a>
          <a href="#experience" className="hero-cta hero-cta-secondary">
            Experience
          </a>
          {resume.email && <SayHiBubble />}
        </div>
        <a href="#projects" className="hero-scroll" aria-label="Scroll to projects">
          <span className="hero-scroll-line" />
          <span className="hero-scroll-dot" />
        </a>
      </div>
    </section>
  )
}
