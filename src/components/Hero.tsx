
import { resume } from '../data/resume'
import { SayHiBubble } from './SayHiBubble'

import './Hero.css'

export function Hero() {
  const titleSegments = resume.title.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean)

  return (
    <section 
      className="hero" 
      aria-label="Introduction"
    >
      <div className="hero-content">
        <p className="hero-eyebrow" style={{ animationDelay: '0ms' }}>
          {titleSegments.map((segment, i) => (
            <span key={i}>
              {i > 0 && <span className="hero-eyebrow-pipe"> | </span>}
              <span className="hero-eyebrow-segment">{segment}</span>
            </span>
          ))}
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
