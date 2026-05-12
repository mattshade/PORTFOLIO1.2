import { projects, type Project } from '../data/projects'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './Projects.css'

function ProjectIcon({ type }: { type?: string }) {
  if (!type) return null
  
  const icons: Record<string, React.ReactNode> = {
    cpu: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
      </svg>
    ),
    terminal: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
    'bar-chart': (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    database: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    layout: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    'pie-chart': (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    ),
    code: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    network: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    zap: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    palette: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
    utensils: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
      </svg>
    ),
    coffee: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    smartphone: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    'trending-up': (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    'credit-card': (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    layers: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    )
  }

  return (
    <div className="project-icon-wrapper">
      {icons[type] || null}
    </div>
  )
}

export function ProjectCard({ p, i, onSelect }: { p: Project; i: number; onSelect: (p: Project) => void }) {
  const cardRef = useRef<HTMLElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  const handleMouseEnter = () => {
    if (p.modalHero) {
      // Preload the high-res hero image so it's ready instantly when clicked
      const img = new Image()
      img.src = p.modalHero
    }
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      className={`project-card glass bird-perch-card${p.wide ? ' project-card-wide' : ''}`}
      style={{ 
        animationDelay: `${i * 60}ms`,
      } as React.CSSProperties}
      onClick={() => onSelect(p)}
    >
      {p.thumbnail && (
        <div className="project-thumb-wrap">
          <img src={p.thumbnail} alt="" className="project-thumb" loading="lazy" />
        </div>
      )}
      <div className="project-header">
        <ProjectIcon type={p.icon} />
        <div className="project-title-wrapper">
          <h3 className="project-title">{p.title}</h3>
          {p.subtitle && (
            <p className="project-subtitle">{p.subtitle}</p>
          )}
        </div>
      </div>
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

export function ProjectDetail({ p, onClose }: { p: Project; onClose: () => void }) {
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.classList.add('modal-open')
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div className="project-detail-overlay">
      <div className="project-detail-backdrop" onClick={onClose} />
      <div className="project-detail-content glass" role="dialog" aria-label={p.title}>
        <div className="detail-inner">
          
          {p.modalHero && (
            <div className="detail-hero">
              <img src={p.modalHero} alt="" className="detail-hero-img" fetchPriority="high" decoding="async" />
              <div className="detail-hero-overlay" />
            </div>
          )}

          <div className="detail-layout">
            <aside className="detail-sidebar">
              <div className="detail-title-block">
                <ProjectIcon type={p.icon} />
                <div className="detail-title-text">
                  <span className="detail-subtitle">{p.subtitle}</span>
                  <h2 className="detail-title">{p.title}</h2>
                </div>
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
        {p.href && (
          <a 
            href={p.href} 
            target={p.external ? "_blank" : undefined}
            rel={p.external ? "noopener noreferrer" : undefined}
            className="detail-top-cta"
            aria-label="View Live Site"
          >
            Visit Site {p.external && '↗'}
          </a>
        )}
        <button type="button" className="project-detail-close" onClick={onClose} aria-label="Close">×</button>
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
