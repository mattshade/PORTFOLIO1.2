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
          viewBox="0 0 24 23" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Body */}
          <path 
            className="boid-body"
            fill="hsl(var(--logo-hue, 142), 45%, 60%)" 
            d="M 12 1 L 20 14 L 23 21 L 16 16 L 12 23 L 8 16 L 1 21 L 4 14 Z"
          />
          
          {/* Eye Group */}
          <g className="boid-eye">
            <circle className="eye-white" cx="12" cy="10.5" r="3.2" fill="#ffffff"/>
            <circle className="eye-pupil" cx="12" cy="10.5" r="1.3" fill="#0a0a0b"/>
          </g>
        </svg>
        
        {/* Subtle trail effects for flight */}
        {isAnimating && (
          <div className="boid-trails">
            <div className="trail-line" />
            <div className="trail-line" />
            <div className="trail-line" />
          </div>
        )}
      </div>
    </button>
  )
}
