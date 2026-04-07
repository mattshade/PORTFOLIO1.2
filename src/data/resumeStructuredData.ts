import { resume, type ExperienceItem, type EducationItem } from './resume'

const MONTHS: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
}

/** Parse "Jul 2025 - Present" / "Oct 2021 - Jul 2025" into ISO month strings */
function parseExperiencePeriod(period: string): { startDate?: string; endDate?: string } {
  const dash = /\s+-\s+/
  const parts = period.split(dash)
  if (parts.length < 2) return {}

  const parseMonYear = (s: string): string | undefined => {
    const m = s.trim().match(/^([A-Za-z]{3})\s+(\d{4})$/)
    if (!m) return undefined
    const mo = MONTHS[m[1]]
    if (!mo) return undefined
    return `${m[2]}-${mo}`
  }

  const start = parseMonYear(parts[0])
  const endRaw = parts.slice(1).join(' - ').trim()
  const end =
    endRaw.toLowerCase() === 'present' ? undefined : parseMonYear(endRaw)

  return { startDate: start, endDate: end }
}

function postalFromLocation(location: string | null | undefined): object | undefined {
  if (!location) return undefined
  const m = location.match(/^([^,]+),\s*([A-Z]{2})\s*$/)
  if (m) {
    return {
      '@type': 'PostalAddress',
      addressLocality: m[1].trim(),
      addressRegion: m[2],
      addressCountry: 'US',
    }
  }
  return { '@type': 'PostalAddress', name: location }
}

function primaryJobTitle(): string {
  return resume.title.split('|')[0]?.trim() || resume.title
}

function organizationRole(job: ExperienceItem, position: number) {
  const { startDate, endDate } = parseExperiencePeriod(job.period)
  const org: Record<string, unknown> = {
    '@type': 'Organization',
    name: job.company,
  }
  const addr = postalFromLocation(job.location ?? undefined)
  if (addr) org.address = addr

  const role: Record<string, unknown> = {
    '@type': 'OrganizationRole',
    roleName: job.role,
    worksFor: org,
  }
  if (startDate) role.startDate = startDate
  if (endDate) role.endDate = endDate

  return {
    '@type': 'ListItem',
    position,
    item: role,
  }
}

function alumniOf(edu: EducationItem) {
  return {
    '@type': 'EducationalOrganization',
    name: edu.school,
    description: edu.degree,
  }
}

/**
 * Schema.org graph for crawlers / ATS-adjacent parsers (Person + structured work history).
 */
export function buildResumeJsonLd(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '')
  const personId = `${base}/#person`
  const workHistoryId = `${base}/#work-history`

  const sameAs = [resume.portfolioUrl, resume.linkedin, resume.github].filter(
    (u): u is string => typeof u === 'string' && u.length > 0
  )

  const currentJob =
    resume.experience.find((j) => j.period.toLowerCase().includes('present')) ??
    resume.experience[0]

  let worksFor: Record<string, unknown> | undefined
  if (currentJob) {
    const addr = postalFromLocation(currentJob.location ?? undefined)
    worksFor = {
      '@type': 'Organization',
      name: currentJob.company,
      ...(addr ? { address: addr } : {}),
    }
  }

  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': personId,
    name: resume.name,
    givenName: 'Matt',
    familyName: 'Shade',
    url: base,
    email: resume.email || undefined,
    jobTitle: primaryJobTitle(),
    description: resume.summary,
    sameAs: sameAs.length ? sameAs : undefined,
    knowsAbout: resume.skills,
    alumniOf: resume.education.map(alumniOf),
    subjectOf: { '@id': workHistoryId },
  }
  if (worksFor) person.worksFor = worksFor

  const graph: object[] = [
    person,
    {
      '@type': 'ItemList',
      '@id': workHistoryId,
      name: 'Work experience',
      numberOfItems: resume.experience.length,
      itemListElement: resume.experience.map((job, i) => organizationRole(job, i + 1)),
    },
  ]

  const doc = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return JSON.stringify(doc)
}
