
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
          Engineering and design leader at NBCUniversal and CNBC. I build large-scale platforms, grow teams, and turn complex technical challenges into clean, high-impact experiences.
        </p>
        <div className="hero-ctas" style={{ animationDelay: '240ms' }}>
          <a href="#projects" className="hero-cta hero-cta-primary">
            Case Studies and Projects
          </a>
          <a href="#experience" className="hero-cta hero-cta-secondary">
            Experience
          </a>
          {resume.email && <SayHiBubble />}
        </div>
      </div>
    </section>
  )
}
