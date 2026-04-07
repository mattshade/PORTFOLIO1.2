import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveProjectsPlugin() {
  return {
    name: 'serve-projects',
    enforce: 'pre' as const,
    configureServer(server: import('vite').ViteDevServer) {
      const distProjects = path.resolve(process.cwd(), 'dist/projects')
      if (!fs.existsSync(distProjects)) return

      const types: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
      }

      server.middlewares.use((req, res, next) => {
        const m = req.url?.split('?')[0]?.match(/^\/projects\/([^/]+)\/?(.*)$/)
        if (!m) return next()
        const [, slug, rest = ''] = m
        const requestFile = rest || 'index.html'
        const filePath = path.join(distProjects, slug, requestFile)
        let toServe = filePath
        if (!fs.existsSync(filePath)) {
          const indexPath = path.join(distProjects, slug, 'index.html')
          if (fs.existsSync(indexPath)) toServe = indexPath
          else return next()
        }
        const ext = path.extname(toServe)
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(fs.readFileSync(toServe))
      })
    },
  }
}

// Inject SITE_URL at build time (Netlify sets URL; fallback for local)
const SITE_URL = process.env.URL || process.env.VITE_SITE_URL || 'https://mattshade.com'

function injectSiteUrlPlugin() {
  return {
    name: 'inject-site-url',
    transformIndexHtml(html: string) {
      return html.replace(/__SITE_URL__/g, SITE_URL)
    },
  }
}

export default defineConfig({
  plugins: [injectSiteUrlPlugin(), serveProjectsPlugin(), react()],
  base: '/',
  server: {
    fs: { allow: [path.resolve(process.cwd(), 'dist')], strict: false },
    hmr: true,
    watch: {
      // Ensure src/data changes trigger HMR
      ignored: ['**/node_modules/**', '**/dist/**', '**/RECENT-PROJECTS/**'],
    },
  },
})
