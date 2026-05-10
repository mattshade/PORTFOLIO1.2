// Internal projects are hosted under /projects/<slug> on the same Netlify site.
// External projects open in a new tab.

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  /** Internal path (e.g. /projects/chatgpt-dashboard) or external URL */
  href: string
  /** If true, opens in new tab and href is full URL */
  external?: boolean
  /** Optional: path to thumbnail under public/ */
  thumbnail?: string
  /** Case-study cards show role context, highlights, and optional wide layout */
  caseStudy?: boolean
  /** e.g. company · focus area */
  subtitle?: string
  /** Short bullets (case study narrative) */
  highlights?: string[]
  /** Span two columns on large grids */
  wide?: boolean
  /** Subtle brand color identifier for the card */
  stats?: { label: string; value: string }[]
  // New capability-focused fields
  role?: string
  contribution?: string
  outcome?: string
  icon?: string
  modalHero?: string
}

export const projects: Project[] = [
  {
    id: 'cnbc-pro-subscription',
    title: 'CNBC PRO Subscription Experience',
    subtitle: 'Product Design & Systems Engineering',
    description: 'Redesigning the premium subscription journey for serious investors to reduce friction, clarify value, and drive a 400% increase in new subscriptions.',
    tech: ['UX/UI Design', 'A/B Testing', 'User Research', 'Design Systems', 'CRO'],
    href: 'https://cnbcpro.shadyworldwide.com/',
    external: true,
    icon: 'credit-card',
    modalHero: '/images/cnbc-pro-hero.png',
    role: 'Senior Interactive Designer',
    contribution: 'Collaborated with the CX team to map the existing user journey, surveyed 16.5k users to define core profiles, and designed A/B tested subscription flows to resolve high drop-off rates and visual inconsistencies. Developed a cohesive "PRO" design system differentiating premium content with a unique blue/green palette.',
    outcome: 'The redesigned "Single View" application was successfully launched, accompanied by the integration of scalable payment solutions. Initial Q1 analytics indicated a 12% increase in immediate conversions, laying the groundwork to hit the 100k subscriber goal.',
    highlights: [
      'Mapped journey & conducted heuristic analysis',
      'Surveyed 16.5k users for persona development',
      'A/B prototype testing of subscription flows',
      'Developed a cohesive PRO design system'
    ]
  },
  {
    id: 'cnbc-design-system',
    title: 'CNBC Design System',
    subtitle: 'Product Design Systems Architecture',
    description: 'Transforming scattered interface patterns into a scalable, data-driven design language and component ecosystem for CNBC’s digital product experience.',
    tech: ['Design Systems', 'Figma', 'Storybook', 'React', 'Taxonomy'],
    href: 'https://cnbcdesignsystem.shadyworldwide.com/',
    external: true,
    icon: 'layers',
    modalHero: '/images/cnbc-ds-hero.png',
    role: 'Senior Interactive Designer',
    contribution: 'I led the evolution of the CNBC Design System from a collection of scattered patterns into a rigorous, production-ready ecosystem. I conducted exhaustive UI audits, established a semantic component taxonomy, and architected the "Foundation to Module" hierarchy. By bridging the gap between Figma libraries and Storybook documentation, I created a shared language for designers and engineers, reducing design debt and accelerating product delivery across editorial and market data teams.',
    outcome: 'Established a centralized source of truth with over 1,000+ elements and components. Successfully integrated Storybook for 1:1 design-to-code parity and implemented Figma Analytics to drive governance, resulting in higher consistency and significantly reduced design-to-engineering friction across multiple product pods.',
    highlights: [
      'Architected "Inventory before Invention" audit',
      'Defined semantic tonal color & spatial systems',
      '1:1 Figma-to-Storybook component parity',
      'Data-led governance via Figma Analytics'
    ]
  },
  {
    id: 'ai-adoption-crm',
    title: 'AI Tool Adoption CRM',
    subtitle: 'AI Operating System',
    description: 'Turning fragmented AI experimentation into a system teams can understand, trust, and scale.',
    tech: ['Systems Thinking', 'Product Design', 'Prototyping', 'Governance'],
    href: 'https://ai-adoption.shadyworldwide.com/',
    external: true,
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
    id: 'agentops-index',
    title: 'DevAgents Index',
    subtitle: 'Monitoring how teams build with AI.',
    description: 'Making sense of how teams build with AI developer tools.',
    tech: ['Systems Thinking', 'Developer Experience', 'Prototyping', 'AI Strategy'],
    href: 'https://dev-agents.shadyworldwide.com/',
    external: true,
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
    id: 'system-design-lab',
    title: 'System Design Lab',
    subtitle: 'Portfolio Design System · Core Patterns',
    description: 'A comprehensive living design system constructed in Storybook to standardize the architectural lime identity across the entire portfolio ecosystem.',
    tech: ['Storybook', 'React', 'CSS Variables', 'TypeScript'],
    href: '/storybook', // Placeholder for now
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
    id: 'signalpath',
    title: 'SignalPath',
    subtitle: 'Mobile AI Decision UX',
    description: 'Designing AI-assisted decisions for moments that cannot wait.',
    tech: ['Mobile Web', 'UX Design', 'Systems Thinking', 'Interaction Design'],
    href: 'https://signalpath.shadyworldwide.com/',
    external: true,
    icon: 'smartphone',
    modalHero: '/images/signalpath-hero.png',
    role: 'Product Designer',
    contribution: 'I explored what it looks like to design a mobile-first system that helps someone make a high-stakes decision with AI. Instead of optimizing for analytics, I modeled a system focusing on signal triage, context compression, and explicit trust checks. I designed a journey where AI synthesizes information and proposes actions, but requires human judgment to proceed, ensuring clarity over completeness under pressure.',
    outcome: 'Created an interaction model for AI-assisted mobile decision making. The system surfaces uncertainty, contextualizes AI confidence, and prioritizes clear action over dense reporting—providing a reliable framework for handling critical alerts when away from the desk.',
    highlights: [
      'Designed for fast decision-making, not deep analysis',
      'Made AI behavior, confidence, and uncertainty legible',
      'Structured trust explicitly with required human checkpoints',
      'Treated mobile constraints as a design feature'
    ]
  },
  {
    id: 'mongodb-dx-copilot',
    title: 'MongoDB DX Copilot',
    subtitle: 'Design review for MongoDB',
    icon: 'database',
    modalHero: '/images/mongodb-schema-hero.png',
    role: 'Creator',
    contribution:
      'I designed and built this app so teams can stress-test a MongoDB data model before they commit serious engineering time. You paste representative sample documents and describe how the product reads and writes the data in plain language—the tool returns a structured report: what to watch, which indexes line up with those patterns, and how risky a migration or schema change might be. The review runs from samples alone; no production cluster connection is required to generate the checklist.',
    outcome:
      'Turns fuzzy “is this shape right?” conversations into a repeatable design review—warnings, index ideas, and rollout notes teams can act on before they lock in code and data paths.',
    description:
      'Paste sample documents and query patterns; get warnings, index ideas, and migration notes for your MongoDB model.',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'MongoDB'],
    href: 'https://mongodbcopilot.netlify.app/',
    external: true,
  },
  {
    id: 'finsignal',
    title: 'FinSignal',
    subtitle: 'Signal-first financial CRM',
    description: 'A modern, system-driven financial CRM designed to cut through noise and surface meaningful insights for wealth platforms.',
    tech: ['Product Design', 'Systems Thinking', 'Data Modeling', 'Financial UX'],
    href: 'https://finsignal.shadyworldwide.com/',
    external: true,
    icon: 'trending-up',
    modalHero: '/images/finsignal-hero.png',
    role: 'Product Designer & Systems Architect',
    contribution: 'I approached FinSignal as a design systems problem, focusing on "Signal Over Noise" to create a data hierarchy model that scales across complex financial workflows. I designed custom components for financial density—including metric cards, risk badges, and AI insight cards—ensuring that dense data remains both powerful and readable. By building a robust mock data layer, I stress-tested the system against realistic scale, prioritizing intelligent action over passive monitoring.',
    outcome: 'Developed a system-of-intelligence prototype that demonstrates how design systems can drive clarity in enterprise wealth management. The final UI reduces cognitive load by connecting data to actionable insights through real-time feeds, predictive alerts, and a clear information hierarchy, moving the platform from a system of record to a system of proactive decision-making.',
    highlights: [
      'Introduced "Signal Score" for intelligent client prioritization',
      'Designed a custom financial component library for high-density data',
      'Built a robust mock data layer for realistic system stress-testing',
      'Reframed the CRM from a system of record to a system of action'
    ]
  },
  {
    id: 'canvas-intelligence',
    title: 'Canvas Intelligence',
    subtitle: 'Thinking Layer for the Canvas',
    description: 'Designing an AI-powered thinking layer to help designers structure ambiguity before generating UI.',
    tech: ['Systems Thinking', 'Interaction Design', 'Product Strategy', 'Prototyping'],
    href: 'https://canvas-studio.shadyworldwide.com/',
    external: true,
    icon: 'palette',
    modalHero: '/images/canvas-intelligence-hero.png',
    role: 'Design & Product Lead',
    contribution: 'I explored how AI could augment the early stages of design by acting as a structural thinking layer. Instead of generating output, I designed an interaction model that takes messy, unformed ideas on a canvas and structures them into connected user journeys, highlighting missing edge cases and revealing system gaps. This reframes the canvas as a continuous space where ideas become structured systems.',
    outcome: 'Prototyped a new paradigm for AI in design tools—shifting from simply generating screens to actively surfacing missing states, flow logic, and system patterns. This approach bridges early exploration with scalable implementation logic.',
    highlights: [
      'Designed a "Messy to Structured" interaction model',
      'Reframed AI as a structural reviewer, not a UI generator',
      'Created a visual "Design Diff" layer for critique',
      'Bridged early exploration with scalable system patterns'
    ]
  },
  {
    id: 'reserving-the-impossible',
    title: 'Reserving the Impossible',
    subtitle: 'Mobile Reservation UX',
    description: 'Designing a resilient mobile reservation experience that gracefully handles real-time constraints, failures, and user uncertainty during high-demand restaurant bookings.',
    tech: ['UX Design', 'Systems Thinking', 'Mobile Web', 'Interaction Design'],
    href: 'https://shady-journey-map.netlify.app/',
    external: true,
    icon: 'utensils',
    modalHero: '/images/reserving-impossible-hero.png',
    role: 'Product Designer',
    contribution: 'I designed a mobile-first reservation flow focused on failure as a first-class experience. Instead of treating errors as dead ends, I reframed them as decision points—preserving user intent across authentication flows, party size constraints, and network instability. I prioritized clear, fast recovery paths that maintain user trust under pressure.',
    outcome: 'Created a scalable interaction model that reduces friction during peak demand, converts failure paths into future opportunities (like waitlist entries), and proves that real-world edge cases require systems thinking rather than just happy-path UI.',
    highlights: [
      'Preserved user intent across auth and retries',
      'Replaced dead ends with clear next steps',
      'Reduced decision friction under pressure',
      'Honest system state communication'
    ]
  },
  {
    id: 'cnbc-quote-page',
    title: 'CNBC Quote Page',
    subtitle: 'Financial Data Infrastructure',
    icon: 'bar-chart',
    modalHero: '/images/data-infrastructure-hero.png',
    role: 'Lead Engineering Manager',
    contribution: 'I led the complete architectural overhaul of CNBC’s flagship quote page. My primary focus was migrating our legacy data-fetching layers from a brittle REST architecture to a robust, scalable GraphQL system. This allowed us to aggregate real-time market data, interactive charts, and related news into a single, high-performance interface that maintains sub-second responsiveness even during extreme market volatility.',
    outcome: 'Improved data reliability and reduced page load times by 40%, ensuring a stable experience for millions of traders during high-traffic market events.',
    description: 'A modern, high-performance financial data engine powered by GraphQL.',
    tech: ['GraphQL', 'React', 'Market Data', 'Real-time Stats'],
    href: '/projects/cnbc-quote-page/',
  },
  {
    id: 'nbc-news-homepage',
    title: 'NBC News Homepage',
    subtitle: 'Scale Media Platform',
    icon: 'globe',
    modalHero: '/images/news-homepage-hero.png',
    role: 'Director of Engineering',
    contribution: 'I directed the engineering execution for the complete redesign of the NBC News digital experience. I managed a multidisciplinary team to unify three disparate codebases into a single, modular React platform. This initiative wasn’t just about the UI; it was about refactoring our editorial CMS integration to support truly cross-platform delivery across web, mobile apps, and syndicated partners like Apple News.',
    outcome: 'Consolidated engineering resources onto a single stack, increasing feature deployment velocity by 3x and establishing a consistent brand identity across all digital touchpoints.',
    description: 'A responsive, high-traffic homepage serving millions of daily readers.',
    tech: ['React', 'Architecture', 'Team Leadership', 'CMS'],
    href: '/projects/nbc-news-homepage/',
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
    href: '/projects/ai-data-hub/',
  },
  {
    id: 'dianachelaru',
    title: 'Diana Chelaru',
    subtitle: 'Art Portfolio',
    icon: 'palette',
    modalHero: '/images/artsy-portfolio-hero.png',
    role: 'Design Engineer',
    contribution: 'I served as the design and implementation lead for artist Diana Chelaru’s digital presence. My focus was on creating a bespoke, high-performance gallery experience that utilized minimal interaction design to keep the focus entirely on the artwork. I focused heavily on image optimization and responsive layouts to ensure the artist’s work looks crisp and intentional on any device.',
    outcome: 'Launched a low-maintenance, high-impact digital portfolio that has served as her primary professional presence for several years.',
    description: 'A minimalist digital gallery for a contemporary artist.',
    tech: ['Design', 'UX', 'Responsive Web'],
    href: 'https://dianachelaru.com',
    external: true,
  },
  {
    id: 'mattshadecooks',
    title: 'Matt Shade Cooks',
    subtitle: 'Personal Brand',
    icon: 'coffee',
    modalHero: '/images/culinary-lab-hero.png',
    role: 'Creator',
    contribution: 'This project serves as my primary technical sandbox for exploring emerging web standards. I use this site to test cutting-edge Next.js patterns, Tailwind utility-first paradigms, and advanced edge-deployment strategies. While the content is personal, the architecture is a rigorous implementation of modern software standards.',
    outcome: 'A production-grade laboratory that has allowed me to validate and then bring high-performance Next.js patterns into my enterprise projects.',
    description: 'A personal collection of recipes and cooking notes built as a technical sandbox.',
    tech: ['Next.js', 'Tailwind', 'Experimentation'],
    href: 'https://mattshadecooks.com',
    external: true,
    wide: true,
  },
]

