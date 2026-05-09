#!/usr/bin/env node
/**
 * Build all project demos before the portfolio build.
 * Runs: npm install + npm run build in each project that requires it.
 */

const { execSync } = require('child_process')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const RECENT = path.join(ROOT, 'RECENT-PROJECTS')

const PROJECTS_TO_BUILD = [
  { dir: 'chatgpt-dashboard', output: 'dist' },
  { dir: 'github-copilot-dashboard', output: 'dist' },
  { dir: 'dev-agents-dashboard', output: 'out' },
  { dir: 'Executive AI Usage Dashboard', output: 'dist' },
]

for (const { dir, output } of PROJECTS_TO_BUILD) {
  const projectPath = path.join(RECENT, dir)
  const packageJson = path.join(projectPath, 'package.json')
  if (!require('fs').existsSync(projectPath) || !require('fs').existsSync(packageJson)) {
    console.warn('Skip (missing):', dir)
    continue
  }
  console.log('\n▶ Building', dir, '...')
  // Force mock/demo mode for portfolio — no real API calls
  const buildEnv = dir === 'github-copilot-dashboard'
    ? { ...process.env, VITE_DEMO_MODE: 'true' }
    : process.env
  try {
    execSync('npm install', { cwd: projectPath, stdio: 'inherit' })
    execSync('npm run build', { cwd: projectPath, stdio: 'inherit', env: buildEnv || process.env })
    console.log('✓', dir)
  } catch (err) {
    console.error('Failed:', dir)
    process.exit(1)
  }
}

console.log('\n✓ All projects built.')
