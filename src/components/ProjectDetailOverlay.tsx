import { useCallback, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { projects } from '../data/projects'
import { ProjectIcon } from './Projects'
import './Projects.css'

type BackgroundLocation = ReturnType<typeof useLocation>

function useProjectOverlayLifecycle(onClose: () => void) {
  useLayoutEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
}

export function ProjectDetailOverlay() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const background = (location.state as { background?: BackgroundLocation } | null)?.background
  const project = projects.find((p) => p.id === id)

  const close = useCallback(() => {
    if (background) {
      navigate(`${background.pathname}${background.search}${background.hash}`)
      return
    }
    navigate('/#projects', { replace: true })
  }, [background, navigate])

  useProjectOverlayLifecycle(close)

  useEffect(() => {
    if (!project) return
    const prev = document.title
    document.title = `Matt Shade — ${project.title}`
    return () => {
      document.title = prev
    }
  }, [project])

  if (!project) {
    return <Navigate to="/#projects" replace />
  }

  const embedSrc = project.spa && project.embedSrc ? project.embedSrc : null

  return createPortal(
    <div className="project-detail-overlay">
      <div className="project-detail-backdrop" onClick={close} aria-hidden />
      <div
        className="project-detail-content project-detail-content--immersive"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <header className="project-detail-toolbar">
          <button type="button" className="project-detail-back" onClick={close}>
            ← Back
          </button>

          <div className="project-detail-toolbar__identity">
            <ProjectIcon type={project.icon} />
            <div className="project-detail-toolbar__text">
              <span className="project-detail-toolbar__title">{project.title}</span>
              {project.subtitle && (
                <span className="project-detail-toolbar__subtitle">{project.subtitle}</span>
              )}
            </div>
          </div>

          <button type="button" className="project-detail-close" onClick={close} aria-label="Close">
            ×
          </button>
        </header>

        {embedSrc ? (
          <iframe title={project.title} src={embedSrc} className="project-detail-embed-frame" />
        ) : (
          <div className="project-detail-fallback">
            <p className="project-detail-fallback__desc">{project.description}</p>
            {project.external ? (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-link-btn"
              >
                Open project ↗
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
