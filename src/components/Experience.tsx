import { useState, useRef, useCallback } from 'react'
import { resume } from '../data/resume'
import { SkillPop } from './SkillPop'
import { ProjectIcon } from './Projects'
import './Projects.css'
import './Experience.css'

function SelectedImpactCard({ items }: { items: string[] }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div className="experience-impact-wrap">
      <article
        ref={cardRef}
        className="project-card glass bird-perch-card experience-impact-card"
        onMouseMove={handleMouseMove}
        tabIndex={0}
        aria-label="Selected Impact — hover or focus to expand"
      >
        <div className="project-card__inner">
          <div className="project-card__icon" aria-hidden>
            <ProjectIcon type="trending-up" />
          </div>
          <div className="project-card__details">
            <div className="project-card__details-inner">
              <h3 className="experience-impact-card__title section-title--mono">Selected Impact</h3>
              <ul className="experience-highlights experience-impact-card__list">
                {items.map((item, i) => (
                  <li key={i} className="experience-highlight">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

const PULL_STRENGTH = 2.5

export function Experience() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [hoverColor, setHoverColor] = useState<string>('#93C572')
  const [pull, setPull] = useState({ x: 0, y: 0 })
  const [popPos, setPopPos] = useState<{ x: number; y: number; color: string } | null>(null)
  const [clickedSkill, setClickedSkill] = useState<string | null>(null)
  const [clickColor, setClickColor] = useState<string>('#93C572')

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
        <div className="section-header-flex">
          <h2 className="section-title section-title--mono">Experience</h2>
          {resume.resumePdf && (
            <a href={resume.resumePdf} download className="experience-download-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download CV
            </a>
          )}
        </div>

        {resume.selectedImpact && resume.selectedImpact.length > 0 && (
          <SelectedImpactCard items={resume.selectedImpact} />
        )}

        <div className="experience-footer-grid">
          <div className="skills-wrap">
            <h3 className="skills-title section-title--mono">Technical Proficiencies</h3>
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

          {resume.education && resume.education.length > 0 && (
            <div className="education-wrap">
              <h3 className="skills-title section-title--mono">Education</h3>
              <div className="education-list">
                {resume.education.map((edu, i) => (
                  <div key={i} className="education-item">
                    <h4 className="edu-school">{edu.school}</h4>
                    <p className="edu-degree">{edu.degree}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
