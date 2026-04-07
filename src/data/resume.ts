// Edit this file to match your resume. You can paste from your PDF or type in your details.

export interface ExperienceItem {
  role: string
  company: string
  period: string
  location?: string | null
  description?: string
  highlights?: string[]
}

export const resume = {
  name: 'Matt Shade',
  title: 'Engineering & Design',
  tagline: 'Creating and leading teams that craft AI-powered tools and interfaces to turn data into clarity and action.',
  email: 'hellomattshade@gmail.com',
  /** Netlify Forms: used when deployed (no config needed). Formspree: set if you prefer it over Netlify. */
  contactFormEndpoint: '', // e.g. https://formspree.io/f/yourformid for Formspree
  contactFormName: 'contact', // Must match the hidden form in index.html for Netlify
  linkedin: '', // e.g. https://linkedin.com/in/mattshade
  github: '',   // e.g. https://github.com/mattshade
  resumePdf: '/Matt_Shade.pdf',

  experience: [
    {
      role: 'Director of AI Engineering',
      company: 'NBCUniversal',
      period: 'Jul 2025 – Present',
      location: 'New York NY',
      description: 'Lead teams building AI-powered discovery, personalization, and internal dashboards.',
      highlights: [
        'Executive dashboards: ChatGPT adoption & Office Hours, AI tool licensing (Slack, Firefly, Copilot), and Developer Agent competitive analysis (Cursor, Copilot, Claude, Codex).',
        'AI Data Hub: interactive catalog of 8 AI/analytics datasets with search, filters, and Chart.js. SharePoint-deployable.',
        'Technical direction across React, Node.js, cloud-native. Partner with design, product, news on adaptive interfaces.',
        'Champion responsible adoption of agentic tools across NBC News.',
      ],
    },
    {
      role: 'Director of Engineering, NBC News Group Digital',
      company: 'NBCUniversal',
      period: 'Oct 2021 – 2025',
      location: 'New York NY',
      description: 'Scaled engineering teams across NBC News, TODAY, MSNBC, and CNBC.',
      highlights: [
        'Modernized web and mobile stacks with React and TypeScript. Prototypes and user research to validate concepts.',
        'Inclusive hiring and coaching. Built teams with high trust and low attrition.',
        'Introduced AI-assisted workflows and prototyping across product lines.',
      ],
    },
    {
      role: 'Tech Lead, CNBC.com Engagement',
      company: 'CNBC',
      period: 'Sep 2015 – Oct 2021',
      location: null,
      description: 'Interactive and personalization features with real-time data visualization.',
      highlights: [
        'Owned subscription flows and stock quotes page. Financial data at scale—clarity, accuracy, speed.',
        'Prototypes that shaped engagement strategy. Mentored engineers on architecture and experimentation.',
      ],
    },
    {
      role: 'Senior Interactive Designer',
      company: 'CNBC',
      period: '2007 – 2015',
      location: null,
      description: 'Interactive experiences and prototypes for web and iOS.',
      highlights: [
        'Interaction design, animation, rapid iteration. Ship fast, learn from users, refine in code.',
        'Turned ideas into working software people could touch and use.',
      ],
    },
  ] as ExperienceItem[],

  skills: [
    'React',
    'TypeScript',
    'Next.js',
    'Vite',
    'Tailwind CSS',
    'Node.js',
    'REST APIs',
    'Data visualization',
    'Antigravity',
    'Claude',
    'Figma Make',
    'Runway Ai',
    'ElevenLabs',
    'ChatGPT',
    'Gemini',
    'GitHub Copilot',
    'Cursor',
    'Microsoft Copilot Studio',
    'Power Automate',
    'M365',
  ],
}
