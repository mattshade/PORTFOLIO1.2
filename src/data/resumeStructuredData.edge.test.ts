import { describe, expect, it, vi } from 'vitest'

vi.mock('./resume', () => ({
  resume: {
    name: 'Test User',
    title: 'Director | Design',
    summary: 'Summary text',
    email: '',
    contactFormEndpoint: '',
    contactFormName: 'contact',
    linkedin: '',
    portfolioUrl: '',
    github: '',
    resumePdf: '/test.pdf',
    skills: ['Design', 'Engineering'],
    education: [{ school: 'School', degree: 'Degree' }],
    experience: [
      {
        role: 'Director',
        company: 'Acme',
        period: 'Jan 2020 - Present',
        location: 'New York, NY',
      },
      {
        role: 'Designer',
        company: 'Beta',
        period: 'invalid',
        location: 'Remote office',
      },
    ],
    selectedImpact: [],
  },
}))

import { buildResumeJsonLd } from './resumeStructuredData'

describe('buildResumeJsonLd edge cases', () => {
  it('builds graph without email or sameAs when omitted', () => {
    const parsed = JSON.parse(buildResumeJsonLd('https://example.com')) as {
      '@graph': Array<Record<string, unknown>>
    }
    const person = parsed['@graph'][0]
    expect(person.email).toBeUndefined()
    expect(person.sameAs).toBeUndefined()
    expect(person.jobTitle).toBe('Director')
  })

  it('handles unparsable experience periods and free-form locations', () => {
    const parsed = JSON.parse(buildResumeJsonLd('https://example.com')) as {
      '@graph': Array<{ itemListElement?: Array<{ item: Record<string, unknown> }> }>
    }
    const roles = parsed['@graph'][1].itemListElement ?? []
    expect(roles[1].item.startDate).toBeUndefined()
    const org = roles[1].item.worksFor as { address?: { name?: string } }
    expect(org.address?.name).toBe('Remote office')
  })
})
