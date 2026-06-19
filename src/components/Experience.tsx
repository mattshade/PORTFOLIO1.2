import { useState, useCallback, useEffect } from 'react'
import { resume } from '../data/resume'
import { SkillPop } from './SkillPop'
import { ProjectIcon } from './Projects'
import './Projects.css'
import './Experience.css'

const IMPACT_PREVIEW_CLOSE_MS = 440

function SelectedImpactInteractive({
  items,
  resumePdf,
}: {
  items: string[]
  resumePdf?: string
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  const activate = useCallback(() => {
    if (panelOpen) return

    const openingFresh = !visible
    setVisible(true)

    if (openingFresh) {
      setPanelOpen(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpen(true))
      })
    } else {
      setPanelOpen(true)
    }
  }, [panelOpen, visible])

  const deactivate = useCallback(() => {
    setPanelOpen(false)
  }, [])

  useEffect(() => {
    if (panelOpen || !visible) return
    const timer = window.setTimeout(() => setVisible(false), IMPACT_PREVIEW_CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [panelOpen, visible])

  return (
    <div
      className="projects-interactive experience-header-interactive"
      onMouseLeave={deactivate}
    >
      <div className="section-header-flex">
        <div className="projects-heading">
          <h2 className="section-title section-title--mono">Experience</h2>
          <button
            type="button"
            className={`project-icon-btn glass bird-perch-card${panelOpen ? ' project-icon-btn--active' : ''}`}
            aria-pressed={panelOpen}
            aria-label="Selected Impact"
            onMouseEnter={activate}
            onFocus={activate}
            onClick={activate}
          >
            <ProjectIcon type="trending-up" />
          </button>
        </div>
        {resumePdf && (
          <a href={resumePdf} download className="experience-download-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CV
          </a>
        )}
      </div>

      {visible && (
        <div
          className={`projects-preview-slot${panelOpen ? ' projects-preview-slot--open' : ''}`}
          aria-hidden={!panelOpen}
        >
          <div className="projects-preview glass">
            <div className="projects-preview__content">
              <ul className="experience-highlights experience-impact__list">
                {items.map((item, i) => (
                  <li key={i} className="experience-highlight">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PULL_STRENGTH = 2.5

function isTouchPrimaryInteraction(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches
}

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
      if (!isTouchPrimaryInteraction()) {
        setPull({ x: (dx / len) * scale, y: (dy / len) * scale })
      }
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
        {resume.selectedImpact && resume.selectedImpact.length > 0 ? (
          <SelectedImpactInteractive items={resume.selectedImpact} resumePdf={resume.resumePdf} />
        ) : (
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
