import { Link, useLocation } from 'react-router-dom'
import { useRef } from 'react'
import './Nav.css'

export function Nav() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const logoRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!logoRef.current) return
    const rect = logoRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    logoRef.current.style.setProperty('--x', x.toString())
    logoRef.current.style.setProperty('--y', y.toString())
  }

  const handleMouseLeave = () => {
    if (!logoRef.current) return
    logoRef.current.style.setProperty('--x', '0')
    logoRef.current.style.setProperty('--y', '0')
  }

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        <Link 
          to="/" 
          className="nav-home"
          ref={logoRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg className="nav-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M 12 1 L 20 14 L 23 21 L 16 16 L 12 23 L 8 16 L 1 21 L 4 14 Z"/>
            <circle cx="12" cy="10.5" r="3.2" fill="#ffffff"/>
            <circle cx="12" cy="10.5" r="1.3" fill="#0a0a0b"/>
          </svg>
          <span className="nav-brand-text">Matt Shade</span>
        </Link>
        <div className="nav-links">
          {isHome ? (
            <>
              <a href="#projects">Projects</a>
              <a href="#experience">Experience</a>
            </>
          ) : (
            <>
              <Link to="/#projects">Projects</Link>
              <Link to="/#experience">Experience</Link>
            </>
          )}
          <Link
            to="/resume"
            className={location.pathname === '/resume' ? 'nav-link-active' : ''}
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
