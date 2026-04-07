import { Link, useLocation } from 'react-router-dom'
import './Nav.css'

export function Nav() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        <Link to="/" className="nav-home">
          <img src="/favicon.svg" alt="" className="nav-logo" width="18" height="18" />
          Matt Shade
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
