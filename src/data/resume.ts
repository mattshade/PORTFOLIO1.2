// Edit this file for the on-site resume page. The downloadable file is `public/Matt_Shade.pdf` (replace manually). Optional: `npm run generate:resume-ats` rebuilds ATS PDF/HTML from this data.

export interface ExperienceItem {
  role: string
  company: string
  period: string
  location?: string | null
  description?: string
  highlights?: string[]
}

export interface EducationItem {
  school: string
  degree: string
}

export const resume = {
  name: 'Matt Shade',
  title: 'AI Engineering Director | Engineering Leadership | Design Engineering',
  tagline:
    'Hands-on engineering and design leader with deep experience building consumer platforms, scaling teams, modernizing digital products, and applying AI to real workflow problems.',
  summary:
    'Hands-on engineering and design leader with deep experience building consumer platforms, scaling teams, modernizing digital products, and applying AI to real workflow problems. Combines leadership across engineering, product, design, and editorial with strong technical depth in web, mobile, cloud, and AI-enabled systems. Known for translating prototypes and experimentation into practical platform improvements, team growth, and measurable operational impact.',
  /** Mirrored in index.html (noscript) for no-JS crawlers — keep in sync */
  email: 'hellomattshade@gmail.com',
  contactFormEndpoint: '',
  contactFormName: 'contact',
  linkedin: 'https://linkedin.com/in/matt-shade-66125515',
  /** Portfolio / personal site — shown on resume and in structured data */
  portfolioUrl: 'https://www.mattshade.com/',
  github: '',
  /** Download link — served from `public/Matt_Shade.pdf`. Bump `v=` when you replace the file so prod CDNs/browsers fetch the new PDF. */
  resumePdf: '/Matt_Shade.pdf?v=2',

  selectedImpact: [
    'Strategically scaled high-performance, multidisciplinary engineering organizations, recruiting top-tier talent and management to accelerate enterprise subscription growth and execute critical digital platform delivery.',
    'Spearheaded a massive architectural consolidation of video infrastructure, synthesizing 8 disparate live and short-form video player integrations into 2 globally standardized systems, drastically reducing platform fragmentation and operational overhead.',
    'Orchestrated the strategic sunsetting of a monolithic legacy application ecosystem, immediately capturing substantial cost savings and reclaiming extensive engineering bandwidth previously lost to technical debt and maintenance.',
    'Architected and deployed specialized GenAI agents designed to optimize critical newsroom operations, significantly accelerating high-stakes newsgathering, streamlining on-air scheduling logistics, and bridging design-to-engineering execution.',
    'Pioneered comprehensive AI-enablement initiatives (curating hands-on workshops and strategic office hours) that successfully fostered deep institutional adoption of agentic tools, driving measurable gains in cross-functional velocity and output quality.',
  ],

  education: [
    { school: 'Mount Ida College', degree: 'Associate of Arts, Graphic Design' },
    { school: 'Katherine Gibbs School', degree: 'Associate of Arts, Visual Communications' },
  ] as EducationItem[],

  experience: [
    {
      role: 'Director of AI Engineering',
      company: 'NBCUniversal',
      period: 'Jul 2025 - Present',
      location: 'New York, NY',
      highlights: [
        'Direct comprehensive AI and agentic workflow strategies across the NBC News Group portfolio, establishing a unified vision for intelligent automation and GenAI adoption.',
        'Partner extensively with cross-functional leadership, including editorial, product, design, and engineering directors, to dramatically accelerate experimentation velocity and resolve day-to-day execution bottlenecks.',
        'Architect and deploy specialized custom agents designed to augment newsroom newsgathering capabilities, resulting in significantly enhanced scheduling efficiency for on-air producers and teams.',
        'Establish and lead robust AI-enablement programs, including regular office hours and hands-on technical workshops, empowering teams to confidently integrate agentic tools (e.g., ChatGPT, Copilot, Cursor) into everyday production workflows.',
        'Steer technical architecture and strategic direction for AI-enabled discovery tools, deep personalization engines, and hybrid workflow systems leveraging React, Node.js, Python, and scalable cloud-native infrastructure (AWS/GCP).',
      ],
    },
    {
      role: 'Director of Engineering, NBC News Group Digital',
      company: 'NBCUniversal',
      period: 'Oct 2021 - Jul 2025',
      location: 'New York, NY',
      highlights: [
        'Successfully built, mentored, and scaled high-performing engineering teams from the ground up, successfully hiring engineering managers and senior software engineers to drive the subscription business and broader digital portfolio.',
        'Spearheaded a critical architectural consolidation of live and short-form video player implementations, migrating 8 disparate media players down to 2 globally supported systems, eliminating platform fragmentation and slashing operational complexity.',
        'Orchestrated the sunsetting and secure retirement of a massive, monolithic legacy application, generating immediate overhead cost savings and reclaiming hundreds of engineering hours previously lost to routine maintenance.',
        'Championed an aggressive modernization initiative targeting web and mobile application performance, systematically migrating legacy codebases to React and TypeScript while enforcing strict CI/CD practices.',
        'Cultivated a healthy, inclusive engineering culture focused on psychological safety, resulting in exceptionally high retention rates, streamlined developer onboarding, and a culture of continuous learning.',
      ],
    },
    {
      role: 'Senior Engineering Manager',
      company: 'CNBC',
      period: 'Sep 2015 - Oct 2021',
      location: 'Englewood Cliffs, NJ',
      highlights: [
        'Served as the primary technical lead for elite interactive and personalization initiatives across CNBC.com, delivering resilient, high-traffic features optimized for strict performance under intense market volatility.',
        'Designed and constructed bespoke subscription workflows and deeply integrated dynamic market-data visualization engines, directly contributing to substantial increases in daily user engagement and subscription conversion metrics.',
        'Collaborated tightly with product managers and UX/UI designers to develop rapid, high-fidelity coded prototypes that proved invaluable in shaping the long-term strategic direction of core editorial features.',
        'Established experimentation frameworks that allowed the business to execute reliable A/B testing on pivotal user flows with statistical confidence.',
        'Provided dedicated mentorship to junior and mid-level engineers, focusing heavily on scalable system architecture, creative problem-solving techniques, and rigorous front-end engineering standards.',
      ],
    },
    {
      role: 'Senior Interactive Designer',
      company: 'CNBC',
      period: 'Jan 2007 - Sep 2015',
      location: 'Englewood Cliffs, NJ',
      highlights: [
        'Conceptualized, designed, and constructed award-winning interactive experiences, acting as a crucial hybrid bridge between visual design intent and rigorous technical implementation.',
        'Pioneered prototype-driven product discovery at CNBC, delivering exploratory web and iOS application interfaces that dramatically reduced engineering rework and validated user needs early in the product lifecycle.',
        'Solidified a deep, foundational expertise in advanced interaction design, CSS/JS animation, and rapid iterative development methodologies.',
        'Created design systems and UI component libraries that ensured visual consistency, accessibility compliance, and accelerated time-to-market for digital campaigns and news interactive features.',
      ],
    },
  ] as ExperienceItem[],

  skills: [
    'AI engineering leadership',
    'Engineering management',
    'Org design',
    'Hiring & team building',
    'Product discovery',
    'Agentic AI & custom agents',
    'ChatGPT',
    'Gemini',
    'Cursor',
    'GitHub Copilot',
    'Microsoft Copilot Studio',
    'JavaScript',
    'TypeScript',
    'React',
    'React Native',
    'Node.js',
    'Python',
    'Swift',
    'PHP',
    'GraphQL',
    'AWS & GCP',
    'Docker',
    'Design systems',
    'Coded prototyping',
    'Interaction design',
    'Experimentation frameworks',
    'CI/CD',
    'Figma',
  ],
}
