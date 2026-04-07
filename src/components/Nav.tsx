import { Link, useLocation } from 'react-router-dom'
import './Nav.css'

export function Nav() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return (
    <nav className="nav" aria-label="Main">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="nav-inner">
        <Link 
          to="/" 
          className="nav-home"
        >
          <svg className="nav-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="hsl(var(--logo-hue, 142), 45%, 60%)" d="M 12 1 L 20 14 L 23 21 L 16 16 L 12 23 L 8 16 L 1 21 L 4 14 Z"/>
            <circle cx="12" cy="10.5" r="3.2" fill="#ffffff"/>
            <circle cx="12" cy="10.5" r="1.3" fill="#0a0a0b"/>
          </svg>
          <span className="nav-brand-text">Matt Shade</span>
        </Link>
        <div className="nav-links">
          {isHome ? (
            <>
              <a href="#projects" className="nav-link bird-perch">Projects</a>
              <a href="#experience" className="nav-link bird-perch">Experience</a>
            </>
          ) : (
            <>
              <Link to="/#projects" className="nav-link bird-perch">Projects</Link>
              <Link to="/#experience" className="nav-link bird-perch">Experience</Link>
            </>
          )}
          <Link
            to="/resume"
            className={`nav-link bird-perch ${location.pathname === '/resume' ? 'nav-link-active' : ''}`}
            onClick={() => {
              if (location.pathname === '/resume') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            Resume
          </Link>
        </div>
      </div>
    </nav>
  )
}
