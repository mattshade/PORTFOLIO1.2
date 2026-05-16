import { resume } from '../data/resume'

import './Hero.css'

export function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-content">
        <h1 className="hero-title hero-title--solo">
          <span className="hero-name">{resume.name}</span>
        </h1>
      </div>
    </section>
  )
}
