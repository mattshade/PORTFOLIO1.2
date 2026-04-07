import { resume } from '../data/resume'
import './Bio.css'

export function Bio() {
  return (
    <section id="bio" className="bio" aria-label="About">
      <div className="bio-inner">
        <div className="bird-wire" aria-hidden />
        <div className="bio-block">
          <p className="bio-text">
            {resume.summary}
          </p>
        </div>
      </div>
    </section>
  )
}
