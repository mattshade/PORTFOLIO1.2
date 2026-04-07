/**
 * After `vite build`, copy built outputs from RECENT-PROJECTS into dist/projects/
 * so internal project links work on Netlify. Run builds for each project first:
 *
 *   cd RECENT-PROJECTS/chatgpt-dashboard && npm ci && npm run build && cd ../..
 *   cd RECENT-PROJECTS/dev-agents-dashboard && npm ci && npm run build && cd ../..
 *   etc.
 *
 * Or copy pre-built dist/out folders into RECENT-PROJECTS/<name>/ before running this.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const RECENT = path.join(ROOT, 'RECENT-PROJECTS')

const PROJECT_SOURCES = [
  { slug: 'chatgpt-dashboard', dir: 'chatgpt-dashboard', output: 'dist' },
  { slug: 'github-copilot-dashboard', dir: 'github-copilot-dashboard', output: 'dist' },
  { slug: 'dev-agents-dashboard', dir: 'dev-agents-dashboard', output: 'out' },
  { slug: 'executive-ai-dashboard', dir: 'Executive AI Usage Dashboard', output: 'dist' },
  { slug: 'ai-data-hub', dir: 'ai-data-hub', output: null }, // copy root HTML + assets
  { slug: 'cfr-dashboard-bugz', dir: 'cfr-dashboard-bugz', output: null }, // static HTML, mock data
]

const SKIP_DIRS = new Set(['.git', 'node_modules', '.next'])

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    if (SKIP_DIRS.has(name)) continue
    const s = path.join(src, name)
    const d = path.join(dest, name)
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d)
    } else {
      fs.copyFileSync(s, d)
    }
  }
}

const projectsDir = path.join(DIST, 'projects')
if (!fs.existsSync(DIST)) {
  console.warn('dist/ not found; run vite build first.')
  process.exit(0)
}
fs.mkdirSync(projectsDir, { recursive: true })

for (const { slug, dir, output } of PROJECT_SOURCES) {
  const srcDir = path.join(RECENT, dir)
  if (!fs.existsSync(srcDir)) {
    console.warn('Skip (missing):', dir)
    continue
  }

  const destDir = path.join(projectsDir, slug)
  if (output) {
    const from = path.join(srcDir, output)
    if (fs.existsSync(from)) {
      copyDir(from, destDir)
      console.log('Copied:', slug, '<-', path.join(dir, output))
    } else {
      console.warn('Skip (no build output):', dir, output)
    }
  } else {
    // Static projects (ai-data-hub, cfr-dashboard-bugz): copy root HTML and assets
    copyDir(srcDir, destDir)
    // Detail pages link to index.html; always sync from index.aspx so updates (e.g. click handlers) apply
    const indexPath = path.join(destDir, 'index.html')
    const aspxPath = path.join(destDir, 'index.aspx')
    if (fs.existsSync(aspxPath)) {
      fs.copyFileSync(aspxPath, indexPath)
      console.log('Copied:', slug, '<-', dir, '(index.html from index.aspx)')
    } else {
      console.log('Copied:', slug, '<-', dir)
    }
  }
}

console.log('Done. Internal project paths: /projects/<slug>/')
