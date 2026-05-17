import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Nav.css'

export function Nav() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`} aria-label="Main">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="nav-inner">
        <Link 
          to="/" 
          className="nav-home"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setIsMenuOpen(false)
            }
          }}
        >
          <svg className="nav-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="var(--accent)" d="M 12 1 L 20 14 L 23 21 L 16 16 L 12 23 L 8 16 L 1 21 L 4 14 Z"/>
            <circle cx="12" cy="10.5" r="3.2" fill="#ffffff"/>
            <circle cx="12" cy="10.5" r="1.3" fill="#0a0a0b"/>
          </svg>
          <span className="nav-brand-text">Matt Shade</span>
        </Link>

        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {isHome ? (
            <a href="#about" className="nav-link bird-perch" onClick={() => setIsMenuOpen(false)}>
              About
            </a>
          ) : (
            <Link to="/#about" className="nav-link bird-perch" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          )}
          {isHome ? (
            <a href="#projects" className="nav-link bird-perch" onClick={() => setIsMenuOpen(false)}>
              Case Studies and Projects
            </a>
          ) : (
            <Link to="/#projects" className="nav-link bird-perch" onClick={() => setIsMenuOpen(false)}>
              Case Studies and Projects
            </Link>
          )}
          {isHome ? (
            <a
              href="#experience"
              className="nav-link bird-perch"
              onClick={() => setIsMenuOpen(false)}
            >
              Experience
            </a>
          ) : (
            <Link
              to="/#experience"
              className="nav-link bird-perch"
              onClick={() => setIsMenuOpen(false)}
            >
              Experience
            </Link>
          )}
          <button 
            className="nav-link bird-perch nav-contact-btn" 
            onClick={() => window.dispatchEvent(new Event('open-contact'))}
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  )
}
