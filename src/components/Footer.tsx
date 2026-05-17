import { resume } from '../data/resume'
import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
  return (
    <>
      <div className="bird-wire" aria-hidden style={{ marginBottom: 0 }} />
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-links">
            {resume.email && (
              <a href={`mailto:${resume.email}`} className="footer-link">{resume.email}</a>
            )}
            {resume.linkedin && (
              <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
            )}
            {resume.github && (
              <a href={resume.github} target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            )}
            <a href="/#experience" className="footer-link">Experience</a>
            <Link to="/project/system-design-lab" className="footer-link">System Design Lab</Link>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} {resume.name}</p>
        </div>
      </footer>
    </>
  )
}
