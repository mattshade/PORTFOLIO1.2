import { useState, useRef, useCallback, useEffect } from 'react'
import { resume } from '../data/resume'
import './Experience.css'

const PULL_STRENGTH = 2.5

export function Experience() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [pull, setPull] = useState({ x: 0, y: 0 })
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
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
      setHoveredSkill(skill)
      setPull({ x: (dx / len) * scale, y: (dy / len) * scale })
    },
    []
  )

  const handleSkillMouseLeave = useCallback(() => {
    setHoveredSkill(null)
    setPull({ x: 0, y: 0 })
  }, [])

  return (
    <section id="experience" className="section experience">
      <div className="section-inner">
        <h2 className="section-title">Experience</h2>
        <div className="experience-list">
          {resume.experience.map((job, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el }}
              className={`experience-item glass ${visibleCards.has(i) ? 'in-view' : ''}`}
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
            {resume.skills.map((s) => (
              <li
                key={s}
                className={`skills-item ${hoveredSkill === s ? 'skills-item-hovered' : ''}`}
                style={
                  hoveredSkill === s
                    ? { transform: `translate(${pull.x}px, ${pull.y}px)` }
                    : undefined
                }
                onMouseMove={handleSkillMouseMove(s)}
                onMouseLeave={handleSkillMouseLeave}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
