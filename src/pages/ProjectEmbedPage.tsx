import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Nav } from '../components/Nav'
import { projects } from '../data/projects'
import './ProjectEmbedPage.css'

export function ProjectEmbedPage() {
  const { id } = useParams<{ id: string }>()
  const project = projects.find((p) => p.id === id)

  useEffect(() => {
    if (!project) return
    const prev = document.title
    document.title = `Matt Shade — ${project.title}`
    return () => {
      document.title = prev
    }
  }, [project])

  if (!project?.spa || !project.embedSrc) {
    return <Navigate to="/#projects" replace />
  }

  return (
    <div className="project-embed-page">
      <div className="app-content project-embed-page__shell">
        <Nav />
        <main id="main-content" className="project-embed-page__main">
          <div className="project-embed-page__toolbar glass">
            <Link to="/#projects" className="project-embed-page__back">
              ← Case Studies and Projects
            </Link>
            <span className="project-embed-page__label">{project.title}</span>
          </div>
          <iframe
            title={project.title}
            src={project.embedSrc}
            className="project-embed-page__frame"
          />
        </main>
      </div>
    </div>
  )
}
