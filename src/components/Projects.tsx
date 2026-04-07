import { projects } from '../data/projects'

import './Projects.css'

export function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="section-inner" style={{ position: 'relative' }}>
        <div className="bird-wire" aria-hidden />
        <h2 className="section-title">
          Projects

        </h2>
        <p className="section-desc projects-intro" style={{ whiteSpace: 'nowrap' }}>
          Interactive demos of dashboards and tools I&apos;ve built. All use sample data—no&nbsp;real or internal data.
        </p>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className="project-card glass"
              style={{ animationDelay: `${i * 60}ms` }}
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
