#!/usr/bin/env node
/**
 * Build portfolio case-study apps (pnpm monorepos, npm, static).
 * Run before vite build / copy-projects.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const {
  PORTFOLIO_PROJECTS,
  basePathForSlug,
  getBuiltOutputDir,
  exists,
} = require('./portfolio-projects.cjs')

function run(cmd, cwd, env = {}) {
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
}

for (const entry of PORTFOLIO_PROJECTS) {
  if (entry.kind === 'static') {
    console.log('✓ static (no build):', entry.slug)
    continue
  }

  if (!exists(entry)) {
    console.warn('Skip (missing root):', entry.slug)
    continue
  }

  const basePath = basePathForSlug(entry.slug)
  console.log('\n▶ Building', entry.slug, '→', basePath)

  if (entry.kind === 'pnpm-monorepo') {
    const root = entry.monorepoRoot
    if (!fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) {
      console.warn('Skip (no pnpm-lock.yaml):', root)
      continue
    }
    if (!fs.existsSync(path.join(root, 'node_modules'))) {
      run('pnpm install', root, { CI: 'true' })
    }
    run(`pnpm --filter ${entry.pnpmFilter} run build`, root, {
      BASE_PATH: basePath,
      NODE_ENV: 'production',
      PORT: '5173',
      CI: 'true',
    })
  } else if (entry.kind === 'npm') {
    const root = entry.projectRoot
    const pkg = path.join(root, 'package.json')
    if (!fs.existsSync(pkg)) {
      console.warn('Skip (no package.json):', root)
      continue
    }
    run('npm install', root, { CI: 'true' })
    // shadcnBlocks (and other npm apps) must use Vite --base for subpath hosting on Netlify.
    const buildEnv = { NODE_ENV: 'production', CI: 'true' }
    run('npx tsc -b', root, buildEnv)
    run(`npx vite build --base=${basePath}`, root, buildEnv)
  }

  const out = getBuiltOutputDir(entry)
  if (!out || !fs.existsSync(out)) {
    console.error('Build output missing for', entry.slug, 'expected', out)
    process.exit(1)
  }
  console.log('✓', entry.slug)
}

console.log('\n✓ Portfolio projects built.')
