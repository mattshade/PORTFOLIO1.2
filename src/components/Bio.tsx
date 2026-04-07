import { resume } from '../data/resume'
import './Bio.css'

export function Bio() {
  return (
    <section id="bio" className="bio" aria-label="About">
      <div className="bio-inner">
        <div className="bird-wire" aria-hidden />
        <h2 className="section-title bio-section-title">Summary</h2>
        <div className="bio-block">
          <p className="bio-text">
            {resume.summary}
          </p>
        </div>
      </div>
    </section>
  )
}
