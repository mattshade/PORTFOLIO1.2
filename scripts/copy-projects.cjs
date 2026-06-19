/**
 * After `vite build`, copy built outputs into dist/projects/
 */

const fs = require('fs')
const path = require('path')
const {
  ROOT,
  RECENT,
  PORTFOLIO_PROJECTS,
  LEGACY_RECENT_PROJECTS,
  getBuiltOutputDir,
} = require('./portfolio-projects.cjs')

const DIST = path.join(ROOT, 'dist')
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

function copyEntry(slug, from, label) {
  const destDir = path.join(DIST, 'projects', slug)
  if (!fs.existsSync(from)) {
    console.warn('Skip (no output):', slug, label || from)
    return
  }
  copyDir(from, destDir)
  if (slug === 'ai-data-hub') {
    const aspxPath = path.join(destDir, 'index.aspx')
    const indexPath = path.join(destDir, 'index.html')
    if (fs.existsSync(aspxPath) && !fs.existsSync(indexPath)) {
      fs.copyFileSync(aspxPath, indexPath)
    }
  }
  console.log('Copied:', slug, '<-', label || from)
}

const projectsDir = path.join(DIST, 'projects')
if (!fs.existsSync(DIST)) {
  console.warn('dist/ not found; run vite build first.')
  process.exit(0)
}
fs.mkdirSync(projectsDir, { recursive: true })

for (const entry of PORTFOLIO_PROJECTS) {
  const from = getBuiltOutputDir(entry)
  copyEntry(entry.slug, from, entry.slug)
}

for (const { slug, dir, output } of LEGACY_RECENT_PROJECTS) {
  const srcDir = path.join(RECENT, dir)
  if (!fs.existsSync(srcDir)) continue
  if (output) {
    copyEntry(slug, path.join(srcDir, output), path.join(dir, output))
  } else {
    copyEntry(slug, srcDir, dir)
  }
}

console.log('Done. Internal project paths: /projects/<slug>/')
