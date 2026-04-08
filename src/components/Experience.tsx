import { useState, useRef, useCallback, useEffect } from 'react'
import { resume } from '../data/resume'
import { SkillPop } from './SkillPop'
import './Experience.css'

const PULL_STRENGTH = 2.5

export function Experience() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [hoverColor, setHoverColor] = useState<string>('#93C572')
  const [pull, setPull] = useState({ x: 0, y: 0 })
  const [popPos, setPopPos] = useState<{ x: number; y: number; color: string } | null>(null)
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const [clickedSkill, setClickedSkill] = useState<string | null>(null)
  const [clickColor, setClickColor] = useState<string>('#93C572')

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => new Set(prev).add(i))
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
      observer.observe(el)
      return observer
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [resume.experience.length])

  const handleSkillMouseMove = useCallback(
    (skill: string) => (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      const len = Math.hypot(dx, dy) || 1
      const scale = Math.min(1, len) * PULL_STRENGTH
      
      if (skill !== hoveredSkill) {
        const colors = ['#ff5c8a', '#93C572', '#38bdf8', '#a855f7', '#facc15']
        setHoverColor(colors[Math.floor(Math.random() * colors.length)])
      }
      
      setHoveredSkill(skill)
      setPull({ x: (dx / len) * scale, y: (dy / len) * scale })
    },
    [hoveredSkill]
  )

  const handleSkillMouseLeave = useCallback(() => {
    setHoveredSkill(null)
    setPull({ x: 0, y: 0 })
  }, [])

  const handleSkillClick = (skill: string) => (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    // Using viewport-relative coordinates for the 'fixed' SkillPop
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    
    // Use the color already established by the hover
    const color = hoverColor
    
    setPopPos({ x, y, color })
    setClickColor(color)
    setClickedSkill(skill)
    // Clear pop position after a delay to allow re-triggering
    setTimeout(() => {
      setPopPos(null)
      setClickedSkill(null)
    }, 1000)
  }

  return (
    <section id="experience" className="section experience">
      {popPos && <SkillPop x={popPos.x} y={popPos.y} color={popPos.color} />}
      <div className="section-inner" style={{ position: 'relative' }}>
        <h2 className="section-title">
          Experience
        </h2>

        {resume.selectedImpact && resume.selectedImpact.length > 0 && (
          <div className="experience-impact" style={{ marginTop: '2.5rem', marginBottom: '4rem' }}>
            <h3 className="skills-title" style={{ marginBottom: '1rem' }}>Selected Impact</h3>
            <ul className="experience-highlights" style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {resume.selectedImpact.map((item, i) => (
                <li key={i} className="experience-highlight">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="experience-list">
          {resume.experience.map((job, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el }}
              className={`experience-item glass bird-perch-card ${visibleCards.has(i) ? 'in-view' : ''}`}
              style={{ transitionDelay: visibleCards.has(i) ? `${i * 80}ms` : '0ms' }}
            >
              <div className="experience-header">
                <h3 className="experience-role">{job.role}</h3>
                <span className="experience-company">{job.company}</span>
                {(job as { location?: string | null }).location && (
                  <span className="experience-location">{(job as { location: string }).location}</span>
                )}
                <span className="experience-period">{job.period}</span>
              </div>
              {(job as { description?: string }).description && (
                <p className="experience-desc">{(job as { description: string }).description}</p>
              )}
              {(job as { highlights?: string[] }).highlights?.length ? (
                <ul className="experience-highlights">
                  {(job as { highlights: string[] }).highlights.map((h, j) => (
                    <li key={j} className="experience-highlight">{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
        <div className="skills-wrap">
          <h3 className="skills-title">Skills</h3>
          <ul className="skills-list">
            {resume.skills.map((s) => {
              const isHovered = hoveredSkill === s
              const isClicked = clickedSkill === s
              
              return (
                <li
                  key={s}
                  className={`skills-item ${isHovered ? 'skills-item-hovered' : ''} ${isClicked ? 'skill-clicked' : ''}`}
                  style={{
                    ...(isHovered ? { transform: `translate(${pull.x}px, ${pull.y}px)`, '--hover-color': hoverColor } as React.CSSProperties : {}),
                    ...(isClicked ? { '--click-color': clickColor } as React.CSSProperties : {})
                  } as React.CSSProperties}
                  onMouseMove={handleSkillMouseMove(s)}
                  onMouseLeave={handleSkillMouseLeave}
                  onClick={handleSkillClick(s)}
                >
                  {s}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
