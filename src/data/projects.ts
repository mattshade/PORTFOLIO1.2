// Internal projects are hosted under /projects/<slug> on the same Netlify site.
// SPA embed routes live at /project/<id> (portfolio shell + iframe).

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  /** Router path for SPA navigation (e.g. /project/agentops-index) */
  href: string
  /** If true, opens in new tab and href is full URL */
  external?: boolean
  /** Client-side route via React Router */
  spa?: boolean
  /** Same-origin URL loaded inside the embed iframe */
  embedSrc?: string
  /** Optional: path to thumbnail under public/ */
  thumbnail?: string
  caseStudy?: boolean
  subtitle?: string
  highlights?: string[]
  wide?: boolean
  stats?: { label: string; value: string }[]
  role?: string
  contribution?: string
  outcome?: string
  icon?: string
  modalHero?: string
}

export const projects: Project[] = [
  {
    id: 'system-design-lab',
    title: 'System Design Lab',
    subtitle: 'Portfolio Design System · Core Patterns',
    description: 'A comprehensive living design system constructed in Storybook to standardize the architectural lime identity across the entire portfolio ecosystem.',
    tech: ['Storybook', 'React', 'CSS Variables', 'TypeScript'],
    href: '/project/system-design-lab',
    spa: true,
    embedSrc: '/storybook/',
    icon: 'layout',
    modalHero: '/images/design-system-hero.png',
    role: 'Principal Design Engineer',
    contribution: 'Architected the core component library, design tokens, and interaction patterns. Established the unified Yellow-Green (Lime) brand system and documented boid flight behavioral specs.',
    outcome: 'Increased development velocity for new project case studies by 40% and ensured 100% aesthetic consistency across the dark blueprint theme.',
    highlights: [
      'Atomic component library in Storybook',
      'Unified CSS-Variable-based token system',
      'Blueprint-spec interaction patterns'
    ]
  },
  {
    id: 'agentops-index',
    title: 'DevAgents Index',
    subtitle: 'Monitoring how teams build with AI.',
    description: 'Making sense of how teams build with AI developer tools.',
    tech: ['Systems Thinking', 'Developer Experience', 'Prototyping', 'AI Strategy'],
    href: '/project/agentops-index',
    spa: true,
    embedSrc: '/projects/agentops-index/',
    icon: 'terminal',
    modalHero: '/images/agentops-index-hero.png',
    role: 'Design & Product Lead',
    contribution: 'I approached the challenge of measuring AI developer tools as a system design problem. Instead of simply building an analytics dashboard, I modeled developer teams like accounts in a CRM, tracking their adoption stages, tool mix, and trust levels. This reframed the conversation from passive tracking to active guidance, allowing organizations to treat enablement as a pipeline and tool evaluation as a strategic capability.',
    outcome: 'Created a prototype operating system that transforms how engineering leadership understands and scales AI-assisted development. By surfacing meaning over metrics, the platform helps teams evaluate different agentic workflows, identify trust breakdowns, and guide intentional adoption across the organization.',
    highlights: [
      'Modeled developer teams as operational units',
      'Evaluated tools strategically across autonomy and trust',
      'Reframed enablement as an active pipeline',
      'Prioritized systemic insights over raw usage data'
    ]
  },
  {
    id: 'ai-adoption-crm',
    title: 'AI Tool Adoption CRM',
    subtitle: 'AI Operating System',
    description: 'Turning fragmented AI experimentation into a system teams can understand, trust, and scale.',
    tech: ['Systems Thinking', 'Product Design', 'Prototyping', 'Governance'],
    href: '/project/ai-adoption-crm',
    spa: true,
    embedSrc: '/projects/ai-adoption-crm/',
    icon: 'network',
    modalHero: '/images/ai-adoption-crm-hero.png',
    role: 'Creator',
    contribution: 'I explored how to treat AI adoption as an operational system rather than a set of disparate tools. Moving beyond basic usage dashboards, I modeled adoption as a CRM for teams—tracking adoption stages, calculating risk automatically, and transforming enablement from an ad-hoc event into an ongoing pipeline. I focused on making system behavior legible and prioritizing actionable insights over dense data.',
    outcome: 'Created a prototype operating model that reframes "AI usage reporting" into actionable governance. The system surfaces risk, identifies tool fragmentation, and generates targeted enablement recommendations, providing leadership with clarity and control over enterprise AI spread.',
    highlights: [
      'Modeled AI adoption as a CRM for teams',
      'Automated risk and maturity scoring',
      'Reframed enablement as an ongoing pipeline',
      'Prioritized action over raw usage insight'
    ]
  },
  {
    id: 'shadcn-blocks',
    title: 'shadcnBlocks',
    subtitle: 'Design System Gallery',
    description: 'A high-fidelity collection of original UI components built with a brutalist, monochrome aesthetic.',
    tech: ['React', 'TypeScript', 'Framer Motion', 'Lucide React'],
    href: '/project/shadcn-blocks',
    spa: true,
    embedSrc: '/projects/shadcn-blocks/',
    icon: 'layout',
    modalHero: '/images/shadcn-blocks-hero.png',
    role: 'Lead Design Engineer',
    contribution: 'I architected and built a custom gallery of original UI components following the shadcn/ui philosophy. I focused on creating a high-contrast, brutalist design system that prioritizes structural clarity and micro-animations. Each component includes a functional "Code" view with syntax highlighting, making it a true resource for other engineers.',
    outcome: 'Launched a standalone component library that serves as a benchmark for high-fidelity interface design and documentation.',
    highlights: [
      'Designed 5 original high-fidelity blocks',
      'Implemented working Code/Preview toggles',
      'Built with a strict Zinc/Black monochrome theme',
      'Integrated Framer Motion for premium micro-interactions'
    ]
  },
  {
    id: 'ai-data-hub',
    title: 'AI Data Hub',
    subtitle: 'Internal Platforms',
    icon: 'network',
    modalHero: '/images/data-infrastructure-hero.png',
    role: 'Solutions Architect',
    contribution: 'I architected the user experience and discovery logic for our internal AI Data Hub. The challenge was organizing thousands of unindexed datasets into a searchable, vetted catalog. I worked closely with our data engineering teams to implement a metadata-driven taxonomy that allows staff to find and request access to training data in seconds.',
    outcome: 'Reduced the "discovery-to-access" phase of the AI R&D lifecycle by over 50%, significantly accelerating our internal prototyping efforts.',
    description: 'A searchable catalog for internal AI and analytics datasets.',
    tech: ['HTML', 'JavaScript', 'Search UX'],
    href: '/project/ai-data-hub',
    spa: true,
    embedSrc: '/projects/ai-data-hub/',
  },
]
