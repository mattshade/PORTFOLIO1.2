import { useCallback, useEffect, useRef, useState } from 'react'
import { projects, type Project } from '../data/projects'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Projects.css'

function useOpenProject() {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback((p: Project) => {
    if (p.external) {
      window.open(p.href, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(`/project/${p.id}`, { state: { background: location } })
  }, [navigate, location])
}

export function ProjectIcon({ type }: { type?: string }) {
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
    ),
  }

  return (
    <div className="project-icon-wrapper">
      {icons[type] || null}
    </div>
  )
}

function ProjectPreviewPanel({ p }: { p: Project }) {
  const location = useLocation()
  const actionLabel = p.external ? 'Open project' : 'View case study'

  const action = p.external ? (
    <a
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      className="projects-preview__action"
    >
      {actionLabel}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </a>
  ) : (
    <Link
      to={`/project/${p.id}`}
      state={{ background: location }}
      className="projects-preview__action"
    >
      {actionLabel}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </Link>
  )

  return (
    <div className="projects-preview__content">
      <div className="projects-preview__header">
        <div className="projects-preview__icon" aria-hidden>
          <ProjectIcon type={p.icon} />
        </div>
        <div className="projects-preview__titles">
          <h3 className="project-title">{p.title}</h3>
          {p.subtitle && <p className="project-subtitle">{p.subtitle}</p>}
        </div>
      </div>
      <p className="project-desc">{p.description}</p>
      {p.highlights && p.highlights.length > 0 && (
        <ul className="project-card-highlights">
          <li>{p.highlights[0]}</li>
        </ul>
      )}
      <ul className="project-tech">
        {p.tech.slice(0, 5).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {action}
    </div>
  )
}

/** @deprecated Used by Storybook — portfolio section uses icon strip + preview panel. */
export function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <div className="projects-preview-slot projects-preview-slot--open" style={{ animationDelay: `${i * 60}ms` }}>
      <div className="projects-preview glass">
        <ProjectPreviewPanel p={p} />
      </div>
    </div>
  )
}

const PREVIEW_CLOSE_MS = 440
const PREVIEW_CLOSE_DELAY_MS = 160

export function Projects() {
  const openProject = useOpenProject()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [displayed, setDisplayed] = useState<Project | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const activate = useCallback((id: string) => {
    cancelClose()
    const project = projects.find((p) => p.id === id)
    if (!project) return
    setActiveId(id)

    if (panelOpen) {
      setDisplayed(project)
      return
    }

    const openingFresh = !displayed
    setDisplayed(project)

    if (openingFresh) {
      setPanelOpen(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelOpen(true))
      })
    } else {
      setPanelOpen(true)
    }
  }, [cancelClose, displayed, panelOpen])

  const deactivate = useCallback(() => {
    setActiveId(null)
    setPanelOpen(false)
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => {
      deactivate()
      closeTimerRef.current = null
    }, PREVIEW_CLOSE_DELAY_MS)
  }, [cancelClose, deactivate])

  useEffect(() => {
    if (panelOpen || !displayed) return
    const timer = window.setTimeout(() => setDisplayed(null), PREVIEW_CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [panelOpen, displayed])

  useEffect(() => () => cancelClose(), [cancelClose])

  return (
    <section id="projects" className="section projects">
      <div className="section-inner">
        <div
          className="projects-interactive"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="projects-heading">
            <h2 className="section-title section-title--mono">Case Studies and Projects</h2>
            <div className="projects-icon-strip" role="list">
              {projects.map((p, i) => {
                const isActive = activeId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="listitem"
                    className={`project-icon-btn glass bird-perch-card${isActive ? ' project-icon-btn--active' : ''}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                    aria-pressed={isActive}
                    aria-label={`${p.external ? 'Open' : 'View'} ${p.title}`}
                    onMouseEnter={() => activate(p.id)}
                    onFocus={() => activate(p.id)}
                    onClick={() => openProject(p)}
                  >
                    <ProjectIcon type={p.icon} />
                  </button>
                )
              })}
            </div>
          </div>

          {displayed && (
            <div
              className={`projects-preview-slot${panelOpen ? ' projects-preview-slot--open' : ''}`}
              aria-hidden={!panelOpen}
              onMouseEnter={cancelClose}
            >
              <div className="projects-preview glass">
                <ProjectPreviewPanel key={displayed.id} p={displayed} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
