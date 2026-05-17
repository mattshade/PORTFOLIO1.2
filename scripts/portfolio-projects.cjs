/**
 * Portfolio-hosted project demos — single source of truth for build, copy, and dev serving.
 * Override roots via env: AGENT_OP_ROOT, AI_ADOPTION_OS_ROOT, SHADCN_BLOCKS_ROOT
 */

const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const HOME = process.env.HOME || '/Users/mattshade'

/** @typedef {'pnpm-monorepo' | 'npm' | 'static'} BuildKind */

/** @type {Array<{
 *   slug: string
 *   kind: BuildKind
 *   spa?: boolean
 *   monorepoRoot?: string
 *   artifactDir?: string
 *   pnpmFilter?: string
 *   projectRoot?: string
 *   buildOutput: string | null
 * }>} */
const PORTFOLIO_PROJECTS = [
  {
    slug: 'agentops-index',
    kind: 'pnpm-monorepo',
    spa: true,
    monorepoRoot: process.env.AGENT_OP_ROOT || path.join(HOME, 'Agent-Op'),
    artifactDir: 'artifacts/agentops-index',
    pnpmFilter: '@workspace/devagents-index',
    buildOutput: 'dist/public',
  },
  {
    slug: 'ai-adoption-crm',
    kind: 'pnpm-monorepo',
    spa: true,
    monorepoRoot: process.env.AI_ADOPTION_OS_ROOT || path.join(HOME, 'AI-Adoption-OS'),
    artifactDir: 'artifacts/ai-adoption-crm',
    pnpmFilter: '@workspace/ai-adoption-crm',
    buildOutput: 'dist/public',
  },
  {
    slug: 'shadcn-blocks',
    kind: 'npm',
    spa: true,
    projectRoot:
      process.env.SHADCN_BLOCKS_ROOT ||
      path.join(HOME, '.gemini/antigravity/scratch/projects/shadcnBlocks'),
    buildOutput: 'dist',
  },
  {
    slug: 'ai-data-hub',
    kind: 'static',
    spa: false,
    projectRoot: path.join(ROOT, 'RECENT-PROJECTS', 'ai-data-hub'),
    buildOutput: null,
  },
]

/** Legacy demos still copied when present under RECENT-PROJECTS */
const LEGACY_RECENT_PROJECTS = [
  { slug: 'chatgpt-dashboard', dir: 'chatgpt-dashboard', output: 'dist' },
  { slug: 'github-copilot-dashboard', dir: 'github-copilot-dashboard', output: 'dist' },
  { slug: 'executive-ai-dashboard', dir: 'Executive AI Usage Dashboard', output: 'dist' },
  { slug: 'cfr-dashboard-bugz', dir: 'cfr-dashboard-bugz', output: null },
]

function basePathForSlug(slug) {
  return `/projects/${slug}/`
}

function artifactRoot(entry) {
  if (entry.kind === 'pnpm-monorepo') {
    return path.join(entry.monorepoRoot, entry.artifactDir)
  }
  return entry.projectRoot
}

function getBuiltOutputDir(entry) {
  if (entry.kind === 'static') {
    return entry.projectRoot
  }
  if (!entry.buildOutput) return null
  return path.join(artifactRoot(entry), entry.buildOutput)
}

function exists(entry) {
  const root =
    entry.kind === 'pnpm-monorepo' ? entry.monorepoRoot : entry.projectRoot
  return root && require('fs').existsSync(root)
}

module.exports = {
  ROOT,
  RECENT: path.join(ROOT, 'RECENT-PROJECTS'),
  PORTFOLIO_PROJECTS,
  LEGACY_RECENT_PROJECTS,
  basePathForSlug,
  artifactRoot,
  getBuiltOutputDir,
  exists,
}
