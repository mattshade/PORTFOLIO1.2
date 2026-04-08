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
    'Engineering & design leader. I build consumer platforms, scale teams, and apply AI to solve real workflow problems.',
  summary:
    'Hands-on engineering and design leader with experience building scale consumer platforms and technical teams. I bridge the gap between engineering, design, and product to move quickly from high-fidelity prototypes to scalable systems that drive real business impact.',
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
    'Scaled high-performance engineering teams, hiring the managers and engineers needed to drive subscription growth and platform delivery.',
    'Consolidated 8 disparate video players into 2 standardized systems, cutting down technical debt and years of operational overhead.',
    'Led the retirement of a massive monolithic legacy application, saving significant costs and reclaiming thousands of engineering hours.',
    'Built custom GenAI agents that solved real newsroom problems, from on-air scheduling to complex newsgathering logistics.',
    'Launched AI-enablement programs (hands-on workshops and technical office hours) that helped teams actually adopt agentic tools into their daily work.',
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
        'Lead AI and agentic workflow strategies across the NBC News Group, building a unified approach for intelligent automation.',
        'Collaborate with editorial, product, and design directors to speed up experimentation and unblock development teams.',
        'Built custom agents to automate newsroom tasks, helping on-air producers save hours on scheduling and logistics.',
        'Established hands-on AI workshops and office hours, teaching teams how to use tools like Cursor and ChatGPT in their daily work.',
        'Drive the architecture for AI discovery tools and personalization engines using React, Node.js, and AWS/GCP.',
      ],
    },
    {
      role: 'Director of Engineering, NBC News Group Digital',
      company: 'NBCUniversal',
      period: 'Oct 2021 - Jul 2025',
      location: 'New York, NY',
      highlights: [
        'Built and managed high-performing teams, hiring the engineering managers and senior staff needed to scale the subscription business.',
        'Led the consolidation of video player tech, moving from 8 different implementations to 2 global systems to reduce complexity.',
        'Retired a massive legacy monolith, saving overhead costs and freeing up hundreds of engineering hours for new features.',
        'Modernized web and mobile apps by migrating legacy code to React and TypeScript with modern CI/CD pipelines.',
        'Focused on building an inclusive engineering culture, resulting in high retention and a better environment for developer growth.',
      ],
    },
    {
      role: 'Senior Engineering Manager',
      company: 'CNBC',
      period: 'Sep 2015 - Oct 2021',
      location: 'Englewood Cliffs, NJ',
      highlights: [
        'Technical lead for interactive features on CNBC.com, building high-traffic tools that stayed stable during peak market volatility.',
        'Designed subscription workflows and data visualization engines that directly increased user engagement and conversions.',
        'Worked with product and design to build high-fidelity prototypes that shaped the direction of core editorial products.',
        'Built experimentation frameworks for reliable A/B testing on multi-million user flows.',
        'Mentored junior and mid-level engineers on system architecture and front-end engineering standards.',
      ],
    },
    {
      role: 'Senior Interactive Designer',
      company: 'CNBC',
      period: 'Jan 2007 - Sep 2015',
      location: 'Englewood Cliffs, NJ',
      highlights: [
        'Designed and built award-winning interactive experiences, serving as the bridge between visual design and technical execution.',
        'Introduced prototype-driven discovery at CNBC, creating web and iOS interfaces that saved months of engineering rework.',
        'Developed deep expertise in interaction design, animation, and iterative product development.',
        'Created the design systems and UI libraries that ensured consistency across CNBC’s digital news features.',
      ],
    },
  ] as ExperienceItem[],

  skills: [
    'AI Engineering Leadership',
    'Engineering Management',
    'Hiring & Team Building',
    'Mentorship',
    'Agentic AI & Custom Agents',
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
    'PHP',
    'GraphQL',
    'GCP',
    'AWS',
    'HTML',
    'CSS',
    'Docker',
    'Design Systems',
    'Experimentation',
    'Interaction Design',
    'CI/CD',
    'Figma',
    'Photoshop',
    'Illustrator',
  ],
}
