import { Link } from 'react-router-dom'
import { resume } from '../data/resume'
import './Resume.css'

export function Resume() {
  return (
    <div className="resume-page">
      <header className="resume-no-print resume-header">
        <Link to="/" className="resume-back">← Back</Link>
        {resume.resumePdf && (
          <a href={resume.resumePdf} download className="resume-download-btn">
            Download resume (PDF)
          </a>
        )}
      </header>
      <article className="resume-doc">
        <header className="resume-doc-header">
          <h1 className="resume-name">{resume.name}</h1>
          <p className="resume-title">{resume.title}</p>
          <p className="resume-tagline">{resume.tagline}</p>
          <address className="resume-contact-row">
            {resume.email && (
              <a href={`mailto:${resume.email}`} className="resume-contact">{resume.email}</a>
            )}
            {resume.portfolioUrl && (
              <a href={resume.portfolioUrl} target="_blank" rel="noopener noreferrer" className="resume-contact">
                mattshade.com
              </a>
            )}
            {resume.linkedin && (
              <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="resume-contact">LinkedIn profile</a>
            )}
            {resume.github && (
              <a href={resume.github} target="_blank" rel="noopener noreferrer" className="resume-contact">GitHub profile</a>
            )}
          </address>
        </header>

        {resume.selectedImpact && resume.selectedImpact.length > 0 && (
          <section className="resume-section">
            <h2 className="resume-section-title">Selected Impact</h2>
            <ul className="resume-highlights">
              {resume.selectedImpact.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

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
          <ul className="resume-skills-list">
            {resume.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
        {resume.education && resume.education.length > 0 && (
          <section className="resume-section resume-section--education">
            <h2 className="resume-section-title">Education</h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="resume-edu">
                <h3 className="resume-role">{edu.school}</h3>
                <p className="resume-company">{edu.degree}</p>
              </div>
            ))}
          </section>
        )}
      </article>
    </div>
  )
}
