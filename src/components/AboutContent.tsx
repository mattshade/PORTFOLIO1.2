import { AboutTextBody } from '../content/aboutTextRender'
import './AboutContent.css'

export function AboutContent() {
  return (
    <article className="about-doc" aria-label="About Matt Shade">
      <AboutTextBody />
    </article>
  )
}
