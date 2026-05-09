# Netlify Deployment

## Pre-deploy checklist

- [ ] `npm run build` completes successfully locally
- [ ] All project demos build (chatgpt, github-copilot, dev-agents, executive-ai)
- [ ] No secrets in repo (`.env` is gitignored in subprojects)
- [ ] Resume PDF exists in `public/Matt_Shade.pdf` (or path in `resume.ts`)

## Deploy

1. Push to GitHub
2. Netlify → **Add new site** → **Import from Git**
3. Select the repo
4. Build settings (from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 (via `netlify.toml` or `.nvmrc`)
5. Deploy

## Project routes

| Path | App |
|------|-----|
| `/` | Portfolio (main SPA) |
| `/projects/chatgpt-dashboard/` | ChatGPT dashboard |
| `/projects/github-copilot-dashboard/` | GitHub Copilot dashboard (mock data) |
| `/projects/dev-agents-dashboard/` | Dev Agents dashboard |
| `/projects/executive-ai-dashboard/` | Executive AI dashboard |
| `/projects/ai-data-hub/` | AI Data Hub (static) |

## Netlify Forms (contact form)

The "Say hi" contact form uses **Netlify Forms** when deployed. No external service (e.g. Formspree) is needed.

**After your first deploy:**

1. Netlify → Site → **Forms** — the `contact` form appears after Netlify detects it
2. **Form notifications** → Add notification → **Email notification** → enter your email
3. Submissions will arrive in your inbox

On localhost, the form falls back to opening your default email client (mailto). To test Netlify Forms, deploy first and use the live URL. Free tier: 100 submissions/month.

## Environment variables (optional)

For **GitHub Copilot dashboard** to use the real GitHub API instead of mock data:

- `VITE_GITHUB_TOKEN` — GitHub personal access token
- `VITE_DEMO_MODE` — Set to `false` to disable mock data
- `VITE_GITHUB_ORG` — Default org slug (e.g. `your-org`)

Set these in Netlify → Site settings → Environment variables if needed.
