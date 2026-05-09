import { useState, useEffect } from 'react'
import './BackToTop.css'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show when scrolled down a bit
      if (window.pageYOffset > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
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
      className={`back-to-top ${isVisible ? 'visible' : ''} ${isAnimating ? 'is-flying' : ''} ${isBlinking ? 'is-blinking' : ''}`}
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
            fill="var(--accent-dim)"
            stroke="var(--accent)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path 
            d="M 12 2 L 12 14"
            stroke="var(--accent)"
            strokeWidth="0.8"
            opacity="0.6"
          />
          <circle cx="12" cy="2" r="1" fill="var(--accent)" />
          <circle cx="20" cy="18" r="0.8" fill="var(--accent)" />
          <circle cx="4" cy="18" r="0.8" fill="var(--accent)" />
          <circle cx="12" cy="14" r="0.8" fill="var(--accent)" />
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
