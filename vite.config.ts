/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

/** Same mapping as scripts/copy-projects.cjs — used when dist/projects/ is missing in dev */
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const PROJECT_SLUG_MAP: Record<string, {
  dir: string;
  output: string | null;
}> = {
  'chatgpt-dashboard': {
    dir: 'chatgpt-dashboard',
    output: 'dist'
  },
  'github-copilot-dashboard': {
    dir: 'github-copilot-dashboard',
    output: 'dist'
  },
  'dev-agents-dashboard': {
    dir: 'dev-agents-dashboard',
    output: 'out'
  },
  'executive-ai-dashboard': {
    dir: 'Executive AI Usage Dashboard',
    output: 'dist'
  },
  'ai-data-hub': {
    dir: 'ai-data-hub',
    output: null
  },
  'cfr-dashboard-bugz': {
    dir: 'cfr-dashboard-bugz',
    output: null
  }
};
function serveProjectsPlugin() {
  return {
    name: 'serve-projects',
    enforce: 'pre' as const,
    configureServer(server: import('vite').ViteDevServer) {
      const cwd = process.cwd();
      const distProjects = path.resolve(cwd, 'dist/projects');
      const recentRoot = path.resolve(cwd, 'RECENT-PROJECTS');
      const types: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.map': 'application/json'
      };
      function resolveProjectFile(slug: string, rest: string): string | null {
        // Shared files under public/projects/ named like `foo.css` (slug `foo.css`) — not a project folder
        const directUnderProjects = path.join(cwd, 'public', 'projects', slug);
        if (fs.existsSync(directUnderProjects) && fs.statSync(directUnderProjects).isFile()) {
          return directUnderProjects;
        }
        const requestFile = rest || 'index.html';
        const publicProjectRoot = path.join(cwd, 'public', 'projects', slug);
        const publicFile = path.join(publicProjectRoot, requestFile);
        if (fs.existsSync(publicFile) && fs.statSync(publicFile).isFile()) {
          return publicFile;
        }
        if (!rest) {
          const publicIndex = path.join(publicProjectRoot, 'index.html');
          if (fs.existsSync(publicIndex) && fs.statSync(publicIndex).isFile()) {
            return publicIndex;
          }
        }
        const candidates: string[] = [];
        if (fs.existsSync(distProjects)) {
          candidates.push(path.join(distProjects, slug, requestFile));
          if (!rest) candidates.push(path.join(distProjects, slug, 'index.html'));
        }
        const map = PROJECT_SLUG_MAP[slug];
        if (!map) {
          for (const p of candidates) {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
          }
          return null;
        }
        const projectRoot = path.join(recentRoot, map.dir);
        if (map.output) {
          const buildDir = path.join(projectRoot, map.output);
          candidates.push(path.join(buildDir, requestFile));
          if (!rest) candidates.push(path.join(buildDir, 'index.html'));
        } else {
          candidates.push(path.join(projectRoot, requestFile));
          if (!rest) {
            candidates.push(path.join(projectRoot, 'index.html'));
            candidates.push(path.join(projectRoot, 'index.aspx'));
          }
        }
        for (const p of candidates) {
          if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
        }
        return null;
      }

      /** True when `rest` is a client-side route (e.g. executive) not a static asset path */
      function restLooksLikeSpaRoute(rest: string): boolean {
        if (!rest) return false;
        const last = rest.split('/').filter(Boolean).pop() || '';
        return path.extname(last) === '';
      }
      server.middlewares.use((req, res, next) => {
        const m = req.url?.split('?')[0]?.match(/^\/projects\/([^/]+)\/?(.*)$/);
        if (!m) return next();
        const [, slug, rest = ''] = m;
        let toServe = resolveProjectFile(slug, rest);
        // SPA fallback: /projects/foo/executive has no physical file; serve project's index.html (matches Netlify redirects)
        if (!toServe && restLooksLikeSpaRoute(rest)) {
          toServe = resolveProjectFile(slug, '');
        }
        if (!toServe) return next();
        const ext = path.extname(toServe);
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(fs.readFileSync(toServe));
      });
    }
  };
}

// Inject SITE_URL at build time (Netlify sets URL; fallback for local)
const SITE_URL = (process.env.URL || process.env.VITE_SITE_URL || 'https://www.mattshade.com').replace(/\/$/, '');

function injectSiteUrlPlugin() {
  return {
    name: 'inject-site-url',
    transformIndexHtml(html: string) {
      // Replace __SITE_URL__/ with SITE_URL/ (to avoid double slashes if the user wrote __SITE_URL__/)
      // and replace __SITE_URL__ with SITE_URL
      return html
        .replace(/__SITE_URL__\//g, `${SITE_URL}/`)
        .replace(/__SITE_URL__/g, SITE_URL);
    }
  };
}
export default defineConfig({
  plugins: [injectSiteUrlPlugin(), serveProjectsPlugin(), react()],
  base: '/',
  server: {
    fs: {
      allow: [path.resolve(process.cwd(), 'dist'), path.resolve(process.cwd(), 'RECENT-PROJECTS')],
      strict: false
    },
    hmr: true,
    watch: {
      // Ensure src/data changes trigger HMR
      ignored: ['**/node_modules/**', '**/dist/**', '**/RECENT-PROJECTS/**']
    }
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
});
