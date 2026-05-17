import { useState, useEffect } from 'react'
import './BackToTop.css'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [inAbout, setInAbout] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      const about = document.getElementById('about')
      if (about) {
        const top = about.getBoundingClientRect().top
        setInAbout(top < window.innerHeight * 0.82)
      }
    }
    toggleVisibility()
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    window.addEventListener('resize', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      window.removeEventListener('resize', toggleVisibility)
    }
  }, [])

  const handleClick = () => {
    if (isAnimating) return
    
    // Trigger blink
    setIsBlinking(true)
    
    // Short delay for the blink before flying
    setTimeout(() => {
      setIsBlinking(false)
      setIsAnimating(true)
      
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      
      // Reset animation state after flight
      setTimeout(() => {
        setIsAnimating(false)
      }, 1200)
    }, 250)
  }

  return (
    <button 
      className={`back-to-top ${isVisible ? 'visible' : ''} ${inAbout ? 'back-to-top--cavern' : ''} ${isAnimating ? 'is-flying' : ''} ${isBlinking ? 'is-blinking' : ''}`}
      onClick={handleClick}
      aria-label="Back to top"
    >
      <div className="boid-container">
        <svg 
          className="boid-flyer" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Architectural wireframe boid */}
          <path
            className="boid-wire"
            d="M 12 2 L 20 18 L 12 14 L 4 18 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M 12 2 L 12 14"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.6"
          />
          <circle cx="12" cy="2" r="1" fill="currentColor" />
          <circle cx="20" cy="18" r="0.8" fill="currentColor" />
          <circle cx="4" cy="18" r="0.8" fill="currentColor" />
          <circle cx="12" cy="14" r="0.8" fill="currentColor" />
        </svg>
        
        {/* Trail effects for flight */}
        <div className="boid-trails">
          <div className="trail-line" />
          <div className="trail-line" />
          <div className="trail-line" />
        </div>
      </div>
    </button>
  )
}
