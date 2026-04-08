import { projects, type Project } from '../data/projects'
import { useRef, useState } from 'react'

import './Projects.css'

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const cardRef = useRef<HTMLElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`project-card glass bird-perch-card${p.wide ? ' project-card-wide' : ''}${p.caseStudy ? ' project-card--case-study' : ''}`}
      style={{ 
        animationDelay: `${i * 60}ms`,
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
        ...(p.accent ? { '--project-accent': p.accent } as React.CSSProperties : {})
      } as React.CSSProperties}
    >
      <a
        href={p.href}
        target={p.external ? '_blank' : undefined}
        rel={p.external ? 'noopener noreferrer' : undefined}
        className="project-link"
      >
        {p.thumbnail && (
          <div
            className={`project-thumb-wrap${p.caseStudy ? ' project-thumb-wrap--contain' : ''}`}
          >
            <img
              src={p.thumbnail}
              alt={p.caseStudy ? `${p.title} screenshot` : ''}
              className={p.caseStudy ? 'project-thumb project-thumb--contain' : 'project-thumb'}
              loading="lazy"
            />
          </div>
        )}
        <div className="project-header">
          <h3 className="project-title">{p.title}</h3>
          <div className="project-badges">
            {p.caseStudy && (
              <span className="project-badge project-badge--case">Case study</span>
            )}
            {p.external && (
              <span className="project-badge" aria-label="Opens in new tab">
                ↗
              </span>
            )}
          </div>
        </div>
        {p.subtitle && (
          <p className="project-subtitle">{p.subtitle}</p>
        )}
        <p className="project-desc">{p.description}</p>
        {p.caseStudy && p.highlights && p.highlights.length > 0 && (
          <ul className="project-case-list">
            {p.highlights.map((line, hi) => (
              <li key={`${p.id}-h-${hi}`}>{line}</li>
            ))}
          </ul>
        )}
        <ul className="project-tech">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </a>
    </article>
  )
}

export function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="section-inner" style={{ position: 'relative' }}>
        <h2 className="section-title">Projects</h2>
        <p className="section-desc projects-intro">
          Interactive demos use sample data only.
        </p>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
