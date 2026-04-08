import { useEffect, useState } from 'react'
import './SkillPop.css'

interface Confetti {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rotSpeed: number
  w: number
  h: number
  color: string
}

export function SkillPop({ x, y, color }: { x: number; y: number; color: string }) {
  const [pieces, setPieces] = useState<Confetti[]>([])

  useEffect(() => {
    const count = 15 // Subtle amount
    const pArr: Confetti[] = []
    
    // Mix of the project color and some lighter/darker tints for "paper" variety
    const colors = [
      color,
      '#ffffff',
      'rgba(255, 255, 255, 0.8)',
      color.replace('0.95', '0.6') // if it was rgba
    ]

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 1.5) - (Math.PI * 1.25) // Upward fan
      const speed = 2 + Math.random() * 4
      pArr.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // Stronger upward burst
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        w: 4 + Math.random() * 4,
        h: 6 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setPieces(pArr)
    
    const timeout = setTimeout(() => setPieces([]), 1500) // Longer for gravity feel
    return () => clearTimeout(timeout)
  }, [x, y, color])

  if (pieces.length === 0) return null

  return (
    <div className="skill-pop-container">
      {pieces.map(p => (
        <div 
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            '--vx': `${p.vx * 60}px`,
            '--vy': `${p.vy * 60}px`,
            '--rot': `${p.rot}deg`,
            '--rot-end': `${p.rot + p.rotSpeed * 20}deg`,
            '--color': p.color,
            backgroundColor: p.color
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
