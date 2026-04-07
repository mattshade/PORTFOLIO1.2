import { useMemo } from 'react'
import { buildResumeJsonLd } from '../data/resumeStructuredData'

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://mattshade.com'

/**
 * Machine-readable Person + work history (schema.org) for search engines and resume parsers.
 */
export function AtsJsonLd() {
  const json = useMemo(() => buildResumeJsonLd(SITE_URL), [])
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  )
}
