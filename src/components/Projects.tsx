import { projects, type Project } from '../data/projects'
import { useEffect, useRef, useState } from 'react'

import './Projects.css'

function ProjectCard({ p, i, onSelect }: { p: Project; i: number; onSelect: (p: Project) => void }) {
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
      className={`project-card glass bird-perch-card${p.wide ? ' project-card-wide' : ''}`}
      style={{ 
        animationDelay: `${i * 60}ms`,
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
        ...(p.accent ? { '--project-accent': p.accent } as React.CSSProperties : {})
      } as React.CSSProperties}
      onClick={() => onSelect(p)}
    >
      {p.thumbnail && (
        <div className="project-thumb-wrap">
          <img src={p.thumbnail} alt="" className="project-thumb" loading="lazy" />
        </div>
      )}
      <div className="project-header">
        <h3 className="project-title">{p.title}</h3>
      </div>
      {p.subtitle && (
        <p className="project-subtitle">{p.subtitle}</p>
      )}
      <p className="project-desc">{p.description}</p>
      {p.highlights && p.highlights.length > 0 && (
         <ul className="project-card-highlights">
           {p.highlights.slice(0, 2).map((h, i) => <li key={i}>{h}</li>)}
         </ul>
      )}
      <ul className="project-tech">
        {p.tech.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </article>
  )
}

function ProjectDetail({ p, onClose }: { p: Project; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.classList.add('modal-open')
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
  }, [])

  return (
    <div className="project-detail-overlay">
      <div className="project-detail-backdrop" onClick={onClose} />
      <div className="project-detail-content glass" role="dialog" aria-label={p.title}>
        <div className="detail-inner">
          <button className="project-detail-close" onClick={onClose} aria-label="Close">×</button>
          
          <div className="detail-layout">
            <aside className="detail-sidebar">
              <div className="detail-title-block">
                <span className="detail-subtitle">{p.subtitle}</span>
                <h2 className="detail-title">{p.title}</h2>
              </div>
              
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span className="label">Role</span>
                  <span className="value">{p.role}</span>
                </div>
                
                <div className="detail-meta-item">
                  <span className="label">Stack</span>
                  <div className="detail-tech-tags">
                    {p.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                </div>
              </div>

              <div className="detail-sidebar-actions">
                <a 
                  href={p.href} 
                  target={p.external ? "_blank" : undefined}
                  rel={p.external ? "noopener noreferrer" : undefined}
                  className="detail-link-btn"
                >
                  View Live Site {p.external && '↗'}
                </a>
              </div>
            </aside>

            <main className="detail-main">
              <section className="detail-section">
                <h3>My Contribution</h3>
                <div className="detail-text-block">
                  <p>{p.contribution}</p>
                </div>
              </section>

              <section className="detail-section">
                <h3>The Outcome</h3>
                <div className="detail-text-block detail-text-block--outcome">
                  <p>{p.outcome}</p>
                </div>
              </section>

              {p.highlights && p.highlights.length > 0 && (
                <section className="detail-section">
                  <h3>Key Deliverables</h3>
                  <ul className="detail-highlights-list">
                    {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <section id="projects" className="section projects">
      <div className="section-inner" style={{ position: 'relative' }}>
        <h2 className="section-title">Case Studies and Projects</h2>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <ProjectCard 
              key={p.id} 
              p={p} 
              i={i} 
              onSelect={setSelectedProject} 
            />
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectDetail 
          p={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </section>
  )
}
