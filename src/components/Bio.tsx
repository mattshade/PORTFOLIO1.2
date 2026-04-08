import { resume } from '../data/resume'
import './Bio.css'

export function Bio() {
  return (
    <section id="bio" className="bio" aria-label="About">
      <div className="bio-inner">
        <h2 className="section-title bio-section-title">Summary</h2>
        <div className="bio-block">
          <p className="bio-typography-wall">
            <span className="bird-perch">{resume.summary}</span>
          </p>
        </div>

        <div className="leadership-pillars">
          <div className="leadership-pillar glass">
            <div className="pillar-header">
              <div className="pillar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="pillar-title">Team & Talent</h3>
            </div>
            <p className="pillar-text">Building high-performing engineering cultures at scale. Specializing in hiring, mentoring, and growing leadership teams across complex news organizations.</p>
          </div>
          <div className="leadership-pillar glass">
            <div className="pillar-header">
              <div className="pillar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
               <h3 className="pillar-title">Platform Scale</h3>
            </div>
            <p className="pillar-text">Modernizing enterprise tech stacks. Consolidated disparate video systems and retired monolithic legacy apps to reclaim thousands of engineering hours.</p>
          </div>
          <div className="leadership-pillar glass">
            <div className="pillar-header">
              <div className="pillar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
              </div>
              <h3 className="pillar-title">AI Leadership</h3>
            </div>
            <p className="pillar-text">Directing AI strategy for NBC News Group. Deploying custom agentic workflows and technical AI-enablement programs to redefine newsgathering protocols.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
