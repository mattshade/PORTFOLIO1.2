import { Link } from 'react-router-dom'
import { resume } from '../data/resume'
import './Resume.css'

export function Resume() {
  const handlePrint = () => window.print()

  return (
    <div className="resume-page">
      <header className="resume-no-print resume-header">
        <Link to="/" className="resume-back">← Back</Link>
        <button type="button" onClick={handlePrint} className="resume-print-btn">
          Print / Save as PDF
        </button>
      </header>
      <article className="resume-doc">
        <header className="resume-doc-header">
          <h1 className="resume-name">{resume.name}</h1>
          <p className="resume-title">{resume.title}</p>
          <p className="resume-tagline">{resume.tagline}</p>
          <div className="resume-contact-row">
            {resume.email && (
              <a href={`mailto:${resume.email}`} className="resume-contact">{resume.email}</a>
            )}
            {resume.linkedin && (
              <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="resume-contact">LinkedIn</a>
            )}
            {resume.github && (
              <a href={resume.github} target="_blank" rel="noopener noreferrer" className="resume-contact">GitHub</a>
            )}
          </div>
        </header>

        <section className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {resume.experience.map((job, i) => (
            <div key={i} className="resume-job">
              <div className="resume-job-header">
                <h3 className="resume-role">{job.role}</h3>
                <span className="resume-period">{job.period}</span>
              </div>
              <p className="resume-company">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
              {job.description && (
                <p className="resume-desc">{job.description}</p>
              )}
              {job.highlights?.length ? (
                <ul className="resume-highlights">
                  {job.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <p className="resume-skills">
            {resume.skills.join(' · ')}
          </p>
        </section>
      </article>
    </div>
  )
}
