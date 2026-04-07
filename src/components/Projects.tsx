import { useRef } from 'react'
import { projects } from '../data/projects'
import './Projects.css'

const READING_DELAY_MS = 1400

export function Projects({ onCardReading }: { onCardReading?: (rect: DOMRect | null) => void }) {
  const hoverRef = useRef<HTMLElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = (e: React.MouseEvent) => {
    hoverRef.current = e.currentTarget as HTMLElement
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const el = hoverRef.current
      if (el && onCardReading) {
        onCardReading(el.getBoundingClientRect())
      }
    }, READING_DELAY_MS)
  }

  const handleLeave = () => {
    hoverRef.current = null
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onCardReading?.(null)
  }

  return (
    <section id="projects" className="section projects">
      <div className="section-inner">
        <h2 className="section-title">Projects</h2>
        <p className="section-desc projects-intro" style={{ whiteSpace: 'nowrap' }}>
          Interactive demos of dashboards and tools I&apos;ve built. All use sample data—no&nbsp;real or internal data.
        </p>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className="project-card glass"
              style={{ animationDelay: `${i * 60}ms` }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <a
                href={p.href}
                target={p.external ? '_blank' : undefined}
                rel={p.external ? 'noopener noreferrer' : undefined}
                className="project-link"
              >
                {p.thumbnail && (
                  <div className="project-thumb-wrap">
                    <img src={p.thumbnail} alt="" className="project-thumb" />
                  </div>
                )}
                <div className="project-header">
                  <h3 className="project-title">{p.title}</h3>
                  {p.external && (
                    <span className="project-badge" aria-label="External link">↗</span>
                  )}
                </div>
                <p className="project-desc">{p.description}</p>
                <ul className="project-tech">
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
