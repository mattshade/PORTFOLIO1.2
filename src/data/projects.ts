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
  accent?: string
  // New capability-focused fields
  role?: string
  contribution?: string
  outcome?: string
}

export const projects: Project[] = [
  {
    id: 'nbc-ai-enablement',
    title: 'AI Enablement Program',
    subtitle: 'Enterprise AI & Training',
    role: 'Director of AI Engineering',
    contribution:
      'I owned executive-facing AI enablement for NBC News Group: a weekly discipline that translated complex programs into clear progress narratives for Data AI & Emerging Tech. I partnered across editorial, standards, legal, audiences, on-air production, product, and engineering to align OKRs, structure AI initiatives as execution-ready Jira work, and advance a portfolio of custom Copilot agents, hands-on ChatGPT office hours, and partner-led training (Microsoft, Google, Adobe). I also helped stand up platform thinking around a unified Data Hub and responsible license and tooling coordination so teams could adopt generative AI safely at enterprise scale.',
    outcome:
      'Established a repeatable operating rhythm of transparent reporting, governed delivery, and scaled training. This structure reduced ambiguity for leadership and accelerated time-to-value for newsroom and engineering teams adopting AI in production workflows.',
    description:
      'Weekly leadership reporting, Copilot agents, and hands-on enablement across the News Group.',
    tech: ['Microsoft Copilot', 'ChatGPT Enterprise', 'GCP', 'Change leadership', 'Agent design'],
    href: '/projects/nbc-ai-enablement/',
    accent: '#312e81',
  },
  {
    id: 'nbc-agent-platform-validation',
    title: 'AI Platform Validation',
    subtitle: 'Agent stack evaluation',
    role: 'Director of AI Engineering',
    contribution:
      'I partnered with platform and product engineering to validate agentic technologies for NBC News Group—not as a one-off bake-off, but as a disciplined comparison of AWS Bedrock AgentCore, Google Vertex AI (Agent Engine + ADK), LangChain/LangGraph, and adjacent options. We pressure-tested each stack against enterprise requirements (security, observability, memory/RAG, long-running agents, cost) and against real org personas: technical builders shipping agents versus citizen users who need guided, governed experiences. I helped the team translate vendor marketing into concrete tradeoffs so we could rank priorities for leadership and set a realistic adoption path.',
    outcome:
      'Delivered a defensible priority view of which agent platforms to invest in first versus pilot or revisit later—reducing thrash, aligning stakeholders on tradeoffs (managed vs flexible, AWS-native vs hybrid), and giving teams a clearer runway for production agent work.',
    description:
      'Cross-team validation of agent platforms to choose NBC News Group’s enterprise direction.',
    tech: ['AWS Bedrock', 'Vertex AI', 'LangGraph', 'Evaluation', 'Governance'],
    href: '/projects/nbc-agent-platform-validation/',
    accent: '#0369a1',
  },
  {
    id: 'cnbc-quote-page',
    title: 'CNBC Quote Page',
    subtitle: 'Financial Data Infrastructure',
    role: 'Lead Engineering Manager',
    contribution: 'I led the complete architectural overhaul of CNBC’s flagship quote page. My primary focus was migrating our legacy data-fetching layers from a brittle REST architecture to a robust, scalable GraphQL system. This allowed us to aggregate real-time market data, interactive charts, and related news into a single, high-performance interface that maintains sub-second responsiveness even during extreme market volatility.',
    outcome: 'Improved data reliability and reduced page load times by 40%, ensuring a stable experience for millions of traders during high-traffic market events.',
    description: 'A modern, high-performance financial data engine powered by GraphQL.',
    tech: ['GraphQL', 'React', 'Market Data', 'Real-time Stats'],
    href: '/projects/cnbc-quote-page/',
    accent: '#00629b',
  },
  {
    id: 'mongodb-dx-copilot',
    title: 'MongoDB DX Copilot',
    subtitle: 'Design review for MongoDB',
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
    accent: '#00ed64',
  },
  {
    id: 'nbc-news-homepage',
    title: 'NBC News Homepage',
    subtitle: 'Scale Media Platform',
    role: 'Director of Engineering',
    contribution: 'I directed the engineering execution for the complete redesign of the NBC News digital experience. I managed a multidisciplinary team to unify three disparate codebases into a single, modular React platform. This initiative wasn’t just about the UI; it was about refactoring our editorial CMS integration to support truly cross-platform delivery across web, mobile apps, and syndicated partners like Apple News.',
    outcome: 'Consolidated engineering resources onto a single stack, increasing feature deployment velocity by 3x and establishing a consistent brand identity across all digital touchpoints.',
    description: 'A responsive, high-traffic homepage serving millions of daily readers.',
    tech: ['React', 'Architecture', 'Team Leadership', 'CMS'],
    href: '/projects/nbc-news-homepage/',
    accent: '#dd3516',
  },
  {
    id: 'chatgpt-dashboard',
    title: 'AI Adoption Dashboard',
    subtitle: 'GenAI Strategy',
    role: 'AI Strategy Lead',
    contribution: 'I designed and built this intelligence dashboard to provide executive leadership with a clear view into our generative AI ROI. The platform tracks API consumption, seat utilization across departments, and internal feature adoption trends. By visualizing this data, we were able to move from anecdotal feedback to evidence-based decisions about our AI enterprise investments.',
    outcome: 'Identified significant cost-saving opportunities by reallocating underutilized licenses, resulting in a 20% budget optimization for our AI program.',
    description: 'Internal tool for tracking company-wide ChatGPT adoption and ROI.',
    tech: ['React', 'Data Viz', 'TypeScript', 'Analytics'],
    href: '/projects/chatgpt-dashboard/',
    accent: '#10a37f',
  },
  {
    id: 'executive-ai-dashboard',
    title: 'Executive AI View',
    subtitle: 'Business Intelligence',
    role: 'Engineering Leader',
    contribution: 'I prototyped this executive visibility tool to bridge the gap between technical AI usage and business resource planning. The goal was to provide a "single source of truth" for license management across multiple tools like Slack AI, Adobe Firefly, and ChatGPT—allowing leadership to plan headcounts and software budgets with actual usage data in hand.',
    outcome: 'Streamlined the annual software procurement process for the design and engineering departments using historical usage projections.',
    description: 'KPI dashboard for enterprise AI license management.',
    tech: ['React', 'Vite', 'Recharts'],
    href: '/projects/executive-ai-dashboard/',
    accent: '#f59e0b',
  },
  {
    id: 'github-copilot-dashboard',
    title: 'Copilot Metrics',
    subtitle: 'Developer Productivity',
    role: 'Director of AI Engineering',
    contribution: 'I spearheaded the internal evaluation of GitHub Copilot’s impact on our engineering velocity. I built this monitoring platform to track code acceptance rates and developer satisfaction. This data was critical in moving beyond the "hype" and understanding exactly where AI-assisted coding was making us faster—and where it needed more governance.',
    outcome: 'Authored the data-backed proposal that led to a organization-wide rollout of Copilot, after proving a 15% net gain in commit-to-merge speed for web teams.',
    description: 'Tracking developer productivity and AI-assisted code generation.',
    tech: ['React', 'Zustand', 'TypeScript', 'Recharts'],
    href: '/projects/github-copilot-dashboard/',
    accent: '#8250df',
  },
  {
    id: 'ai-data-hub',
    title: 'AI Data Hub',
    subtitle: 'Internal Platforms',
    role: 'Solutions Architect',
    contribution: 'I architected the user experience and discovery logic for our internal AI Data Hub. The challenge was organizing thousands of unindexed datasets into a searchable, vetted catalog. I worked closely with our data engineering teams to implement a metadata-driven taxonomy that allows staff to find and request access to training data in seconds.',
    outcome: 'Reduced the "discovery-to-access" phase of the AI R&D lifecycle by over 50%, significantly accelerating our internal prototyping efforts.',
    description: 'A searchable catalog for internal AI and analytics datasets.',
    tech: ['HTML', 'JavaScript', 'Search UX'],
    href: '/projects/ai-data-hub/',
    accent: '#ec4899',
  },
  {
    id: 'cfr-dashboard-bugz',
    title: 'CFR Dashboard',
    subtitle: 'DORA Metrics',
    role: 'Engineering Manager',
    contribution: 'I built this DORA-focused visibility tool to introduce more rigorous operational standards to our release cycle. By tracking Change Failure Rates (CFR) and Mean Time to Recovery (MTTR) in real-time, we were able to identify unstable deployment patterns and implement more robust automated testing gates in our pipelines.',
    outcome: 'Successfully reduced change failure rates by 12% within the first six months by operationalizing DORA metrics across the engineering organization.',
    description: 'A deployment visibility dashboard focusing on Change Failure Rate trends.',
    tech: ['Chart.js', 'Stats', 'Dashboard Design'],
    href: '/projects/cfr-dashboard-bugz/',
    accent: '#f97316',
  },
  {
    id: 'dev-agents-dashboard',
    title: 'AI Agent Analysis',
    subtitle: 'Competitive Landscape',
    role: 'AI Research Lead',
    contribution: 'I led a rigorous competitive teardown of the emerging AI "Agentic" IDE market. I developed a weighted scorecard system to evaluate tools like Claude Code, Cursor, and Codex on dimensions of security, context awareness, and DX. This objective framework was essential for aligning our engineering directors on a long-term toolchain strategy.',
    outcome: 'Established a standardized AI tool evaluation framework that is now used for all new developer-facing AI integrations.',
    description: 'Competitive teardown and scorecard for the leading AI coding agents.',
    tech: ['Next.js', 'Analysis', 'Strategy'],
    href: '/projects/dev-agents-dashboard/',
    accent: '#3b82f6',
  },
  {
    id: 'dianachelaru',
    title: 'Diana Chelaru',
    subtitle: 'Art Portfolio',
    role: 'Design Engineer',
    contribution: 'I served as the design and implementation lead for artist Diana Chelaru’s digital presence. My focus was on creating a bespoke, high-performance gallery experience that utilized minimal interaction design to keep the focus entirely on the artwork. I focused heavily on image optimization and responsive layouts to ensure the artist’s work looks crisp and intentional on any device.',
    outcome: 'Launched a low-maintenance, high-impact digital portfolio that has served as her primary professional presence for several years.',
    description: 'A minimalist digital gallery for a contemporary artist.',
    tech: ['Design', 'UX', 'Responsive Web'],
    href: 'https://dianachelaru.com',
    external: true,
    accent: '#db2777',
  },
  {
    id: 'mattshadecooks',
    title: 'Matt Shade Cooks',
    subtitle: 'Personal Brand',
    role: 'Creator',
    contribution: 'This project serves as my primary technical sandbox for exploring emerging web standards. I use this site to test cutting-edge Next.js patterns, Tailwind utility-first paradigms, and advanced edge-deployment strategies. While the content is personal, the architecture is a rigorous implementation of modern software standards.',
    outcome: 'A production-grade laboratory that has allowed me to validate and then bring high-performance Next.js patterns into my enterprise projects.',
    description: 'A personal collection of recipes and cooking notes built as a technical sandbox.',
    tech: ['Next.js', 'Tailwind', 'Experimentation'],
    href: 'https://mattshadecooks.com',
    external: true,
    accent: '#0ea5e9',
  },
]

