import { useRef, type ReactNode } from 'react'
import { resume } from '../data/resume'
import './Projects.css'
import './Bio.css'

const PILLARS = [
  {
    title: 'Team & Talent',
    text: 'Building high-performing engineering cultures at scale. Specializing in hiring, mentoring, and growing leadership teams across complex news organizations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Platform Scale',
    text: 'Modernizing enterprise tech stacks. Consolidated disparate video systems and retired monolithic legacy apps to reclaim thousands of engineering hours.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    title: 'AI Leadership',
    text: 'Directing AI strategy for NBC News Group. Deploying custom agentic workflows and technical AI-enablement programs to redefine newsgathering protocols.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
  },
] as const

function LeadershipPillarCard({
  title,
  text,
  icon,
  index,
}: {
  title: string
  text: string
  icon: ReactNode
  index: number
}) {
  const cardRef = useRef<HTMLElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <article
      ref={cardRef}
      className="project-card glass bird-perch-card bio-pillar-card"
      onMouseMove={handleMouseMove}
      tabIndex={0}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`${title} — hover or focus to expand`}
    >
      <div className="project-card__inner">
        <div className="project-card__icon" aria-hidden>
          <div className="project-icon-wrapper">{icon}</div>
        </div>
        <div className="project-card__details">
          <div className="project-card__details-inner">
            <h3 className="pillar-title bio-pillar-card__title">{title}</h3>
            <p className="pillar-text">{text}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export function Bio() {
  return (
    <section id="bio" className="bio" aria-label="About">
      <div className="bio-inner">
        <div className="bio-block">
          <div className="bio-intro">
            <div className="bio-portrait">
              <img
                src="/images/matt-shade-profile.png"
                alt="Matt Shade"
                width={168}
                height={210}
                loading="eager"
                decoding="async"
              />
            </div>
            <p className="bio-typography-wall">
              <span className="bird-perch">{resume.summary}</span>
            </p>
          </div>
        </div>

        <div className="leadership-pillars">
          {PILLARS.map((pillar, i) => (
            <LeadershipPillarCard key={pillar.title} {...pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
