# Netlify Deployment

## Pre-deploy checklist

- [ ] `npm run build` completes successfully locally (or `bash scripts/netlify-build.sh` on CI)
- [ ] Case-study repos are reachable (public, or `GITHUB_TOKEN` set for private clones)
- [ ] shadcnBlocks clones from `https://github.com/mattshade/shadcnBlocks.git` (default in `netlify-build.sh`)
- [ ] No secrets committed (`.env` is gitignored)
- [ ] Resume PDF exists in `public/Matt_Shade_Resume.pdf` (or path in `resume.ts`)

## Deploy

1. Push to GitHub
2. Netlify → **Add new site** → **Import from Git**
3. Select the repo
4. Build settings (from `netlify.toml`):
   - Build command: `bash scripts/netlify-build.sh`
   - Publish directory: `dist`
   - Node version: `20` (set in `netlify.toml` as `NODE_VERSION`)
5. Add environment variables below → **Deploy**

## Netlify environment variables

Set in **Site configuration → Environment variables** (scopes: **Build** unless noted).

### Optional — clone URLs and refs (defaults shown)

All case-study repos are public; no `GITHUB_TOKEN` is required unless you switch to private repos.

| Variable | Default value | Notes |
|----------|----------------|--------|
| `AGENT_OP_REPO` | `https://github.com/mattshade/Agent-Op.git` | DevAgents Index monorepo |
| `AGENT_OP_REF` | `main` | |
| `AI_ADOPTION_OS_REPO` | `https://github.com/mattshade/AI-Adoption-OS.git` | AI Adoption CRM monorepo |
| `AI_ADOPTION_OS_REF` | `main` | |
| `SHADCN_BLOCKS_REPO` | `https://github.com/mattshade/shadcnBlocks.git` | shadcnBlocks app |
| `SHADCN_BLOCKS_REF` | `main` | |

### Optional — private repos only

| Variable | Value | Notes |
|----------|--------|--------|
| `GITHUB_TOKEN` | `ghp_…` or fine-grained PAT | **Secret.** Only needed if clone repos are private. |

### Optional — local paths on the build machine

Only set these if clones live somewhere other than the Netlify build parent directory. On Netlify, clones go under `/opt/build` by default.

| Variable | Default on Netlify | Notes |
|----------|-------------------|--------|
| `NETLIFY_BUILD_BASE` | `/opt/build` | Parent directory for cloned repos |
| `AGENT_OP_ROOT` | `/opt/build/Agent-Op` | |
| `AI_ADOPTION_OS_ROOT` | `/opt/build/AI-Adoption-OS` | |
| `SHADCN_BLOCKS_ROOT` | `/opt/build/shadcnBlocks` | |

### Optional — legacy embedded demos (RECENT-PROJECTS)

Only if you build those apps into `RECENT-PROJECTS/*/dist` before deploy, or set at build time for Copilot live API:

| Variable | Example value | Notes |
|----------|----------------|--------|
| `VITE_GITHUB_TOKEN` | `ghp_…` | **Secret.** GitHub Copilot dashboard live API |
| `VITE_DEMO_MODE` | `false` | Disable mock data when token is set |
| `VITE_GITHUB_ORG` | `your-org` | Default org for Copilot dashboard |

### Set in `netlify.toml` (do not duplicate unless overriding)

| Variable | Value |
|----------|--------|
| `NODE_VERSION` | `20` |

## Copy-paste (Netlify UI)

No environment variables are required for deploy — `scripts/netlify-build.sh` clones public repos by default:

- `https://github.com/mattshade/Agent-Op.git`
- `https://github.com/mattshade/AI-Adoption-OS.git`
- `https://github.com/mattshade/shadcnBlocks.git`

Override `*_REPO` / `*_REF` only if you use forks or non-`main` branches. Add `GITHUB_TOKEN` only for private repos.

## Project routes

| Path | App |
|------|-----|
| `/` | Portfolio (main SPA) |
| `/project/:id` | Embedded case study (iframe) |
| `/storybook/` | Design system (Storybook static) |
| `/projects/agentops-index/` | DevAgents Index |
| `/projects/ai-adoption-crm/` | AI Tool Adoption CRM |
| `/projects/shadcn-blocks/` | shadcnBlocks |
| `/projects/ai-data-hub/` | AI Data Hub (static, in repo) |
| `/projects/chatgpt-dashboard/` | Legacy demo (if built) |
| `/projects/github-copilot-dashboard/` | Legacy demo (if built) |
| `/projects/executive-ai-dashboard/` | Legacy demo (if built) |
| `/projects/cfr-dashboard-bugz/` | Legacy demo (if built) |

## Netlify Forms (contact form)

The "Say hi" contact form uses **Netlify Forms** when deployed. No external service (e.g. Formspree) is needed.

**After your first deploy:**

1. Netlify → Site → **Forms** — the `contact` form appears after Netlify detects it
2. **Form notifications** → Add notification → **Email notification** → enter your email
3. Submissions will arrive in your inbox

On localhost, the form falls back to opening your default email client (mailto). To test Netlify Forms, deploy first and use the live URL. Free tier: 100 submissions/month.
