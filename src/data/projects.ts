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
}

export const projects: Project[] = [
  // —— Internal demos (interactive UIs with sample data—no real/internal data) ——
  {
    id: 'chatgpt-dashboard',
    title: 'ChatGPT Enablement Dashboard',
    description: 'Demo of an exec dashboard: adoption KPIs, feature usage, and Office Hours analytics. Sample data only.',
    tech: ['React', 'Vite', 'TypeScript', 'Tailwind', 'Recharts'],
    href: '/projects/chatgpt-dashboard/',
  },
  {
    id: 'github-copilot-dashboard',
    title: 'GitHub Copilot Metrics Dashboard',
    description: 'Demo showing seat utilization, activity trends, and adoption by team. Mock data.',
    tech: ['React', 'Vite', 'TypeScript', 'Recharts', 'Zustand'],
    href: '/projects/github-copilot-dashboard/',
  },
  {
    id: 'dev-agents-dashboard',
    title: 'Developer Agent Competitive Analysis',
    description: 'Executive comparison of Antigravity, Claude Code, Copilot, Codex, and Cursor. Scorecards and recs.',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
    href: '/projects/dev-agents-dashboard/',
  },
  {
    id: 'executive-ai-dashboard',
    title: 'AI Usage Dashboard',
    description: 'Demo tracking AI tool usage (Slack AI, ChatGPT, Firefly, Copilot). KPIs and license views. Sample data.',
    tech: ['React', 'Vite', 'TypeScript', 'Recharts'],
    href: '/projects/executive-ai-dashboard/',
  },
  {
    id: 'ai-data-hub',
    title: 'AI Data Hub',
    description: 'Data catalog UI: browse, search, filter AI/analytics datasets. Static demo.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    href: '/projects/ai-data-hub/',
  },
  {
    id: 'cfr-dashboard-bugz',
    title: 'CFR Dashboard',
    description: 'DORA-style deployment metrics demo. Change failure rate, trends. Sample data.',
    tech: ['HTML', 'Chart.js', 'JavaScript'],
    href: '/projects/cfr-dashboard-bugz/',
  },
  // —— External (live sites) — at bottom ———
  {
    id: 'dianachelaru',
    title: 'Diana Chelaru',
    description: 'Portfolio and presence for artist Diana Chelaru.',
    tech: ['Web', 'Design'],
    href: 'https://dianachelaru.com',
    external: true,
  },
  {
    id: 'mattshadecooks',
    title: 'Matt Shade Cooks',
    description: 'Recipes and cooking notes.',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
    href: 'https://mattshadecooks.com',
    external: true,
  },
]
