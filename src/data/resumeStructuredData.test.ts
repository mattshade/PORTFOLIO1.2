import { describe, expect, it } from 'vitest'
import { buildResumeJsonLd } from './resumeStructuredData'
import { resume } from './resume'

describe('buildResumeJsonLd', () => {
  it('returns valid JSON with Person and work history graph', () => {
    const json = buildResumeJsonLd('https://www.mattshade.com')
    const parsed = JSON.parse(json) as {
      '@context': string
      '@graph': Array<Record<string, unknown>>
    }

    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@graph']).toHaveLength(2)
    expect(parsed['@graph'][0]['@type']).toBe('Person')
    expect(parsed['@graph'][0].name).toBe(resume.name)
    expect(parsed['@graph'][1]['@type']).toBe('ItemList')
    expect(parsed['@graph'][1].numberOfItems).toBe(resume.experience.length)
  })

  it('buildResumeJsonLd handles jobs without parseable locations', () => {
    const json = buildResumeJsonLd('https://www.mattshade.com')
    const parsed = JSON.parse(json) as { '@graph': Array<{ itemListElement?: Array<{ item: { worksFor?: { address?: unknown } } }> }> }
    const roles = parsed['@graph'][1].itemListElement ?? []
    expect(roles.length).toBeGreaterThan(0)
    expect(roles[0].item.worksFor?.address).toBeDefined()
  })

  it('buildResumeJsonLd omits endDate for present roles', () => {
    const json = buildResumeJsonLd('https://www.mattshade.com')
    const parsed = JSON.parse(json) as {
      '@graph': Array<{ itemListElement?: Array<{ item: Record<string, unknown> }> }>
    }
    const presentRole = (parsed['@graph'][1].itemListElement ?? []).find((entry) =>
      String(entry.item.roleName).toLowerCase().includes('director') ||
      String(entry.item.roleName).toLowerCase().includes('lead'),
    )
    expect(presentRole?.item.startDate).toBeTruthy()
  })
})
