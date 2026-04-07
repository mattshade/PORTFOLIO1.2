# Matt Shade — Portfolio

A modern, dark-mode portfolio inspired by [Vercel](https://vercel.com) and iOS liquid glass aesthetics. Built for Netlify deployment, with optional hosting of project demos on the same domain.

---

## Project vision

This portfolio should feel:

- **Technical and modern** — Dark background (#0a0a0b), cyan accent (#22d3ee), subtle grid and glow effects
- **Minimal and functional** — Clear hierarchy, no visual clutter
- **Professional** — Glassmorphism-style cards, smooth transitions, high contrast

### Design system

| Token        | Value          | Use                          |
|-------------|-----------------|------------------------------|
| Background  | `#0a0a0b`       | Page background              |
| Text        | `#fafafa`       | Primary body text            |
| Muted       | `#a1a1aa`       | Secondary text               |
| Accent      | `#22d3ee`       | Links, highlights, accents   |
| Glass       | `rgba(17,17,19,0.72)` | Frosted cards           |
| Border      | `rgba(255,255,255,0.08)` | Subtle borders       |

**Typography:** Geist (sans) and Geist Mono, loaded from Google Fonts.

---

## Page structure

The site is a single-page application with these sections (top to bottom):

### 1. Fixed navigation

- **Left:** Site name (links to top)
- **Right:** "Projects" and "Experience" anchor links
- **Style:** Dark glass bar with backdrop blur, fixed to viewport top

### 2. Hero section

- **Eyebrow:** "Engineering & Product" (mono, uppercase)
- **Headline:** Your name (e.g. "Matt Shade")
- **Tagline:** One-line value proposition
- **CTAs:** "View projects" and "Experience" buttons
- **Background:** Animated grid, soft glows, gradient; optional pixel/bird animation layer

### 3. Projects section

- **Title:** "Projects"
- **Intro:** Short description of the work shown
- **Grid:** Cards in a responsive grid; each card has:
  - Title
  - Description
  - Tech tags
  - Link (internal path or external URL)

**Project types:**

- **Internal** — Served from `/projects/<slug>/` on the same Netlify site
- **External** — Full URL, opens in new tab (e.g. dianachelaru.com, mattshadecooks.com)

Order: internal projects first, external projects last.

### 4. Experience section

- **Title:** "Experience"
- **Content:** Timeline-style list of roles
- **Each role:** Company, title, period, short description

### 5. Footer

- Links: Resume PDF, email, LinkedIn, GitHub
- Shows only what is configured in `resume.ts`

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** — Dev server and production build
- **CSS** — Custom properties, no Tailwind
- **Deploy:** Static site for Netlify, GitHub Pages, etc.

---

## Project structure

```
PORTFOLIO/
├── index.html              # Entry HTML, fallback content
├── package.json
├── vite.config.ts
├── tsconfig.json
├── netlify.toml            # Build command, publish dir, redirects
│
├── src/
│   ├── main.tsx            # React entry
│   ├── App.tsx             # Root layout: Nav, Hero, Projects, Experience, Footer
│   ├── index.css           # Global styles, variables
│   ├── App.css             # Section styles
│   │
│   ├── components/
│   │   ├── Nav.tsx         # Fixed top bar
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Projects.tsx    # Project cards grid
│   │   ├── Experience.tsx  # Experience timeline
│   │   ├── Footer.tsx      # Resume/social links
│   │   └── BirdsFly.tsx    # (Optional) Pixel/bird animation for hero
│   │
│   └── data/
│       ├── resume.ts       # Name, tagline, experience, skills, contact
│       └── projects.ts     # Project list and metadata
│
├── public/
│   ├── favicon.svg
│   └── Matt_Shade.pdf      # Resume PDF (or your filename)
│
├── scripts/
│   └── copy-projects.cjs   # Copies built demos into dist/projects/
│
└── RECENT-PROJECTS/        # Source for project demos (see below)
    ├── chatgpt-dashboard/
    ├── dev-agents-dashboard/
    ├── Executive AI Usage Dashboard/
    └── ai-data-hub/
```

---

## Hosted project demos

Some project cards link to demos served from the same Netlify site to avoid exposing internal or local URLs.

### Flow

1. Each demo is built separately (Vite → `dist/`, Next.js static export → `out/`, etc.).
2. The portfolio build script copies those outputs into `dist/projects/<slug>/`.
3. Netlify serves them under `/projects/<slug>/`.

### Build requirements per project

| Project        | Framework | Build output      | Notes                                   |
|----------------|-----------|-------------------|-----------------------------------------|
| chatgpt-dashboard | Vite   | `dist/`           | Set `base: '/projects/chatgpt-dashboard/'` |
| dev-agents-dashboard | Next.js | `out/` | Needs `output: 'export'`, `basePath`   |
| executive-ai-dashboard | Vite | `dist/` | Set `base: '/projects/executive-ai-dashboard/'` |
| ai-data-hub    | Static HTML | Root files | Copy script also creates `index.html` from `index.aspx` |
| CHECKY         | Next.js + Prisma | N/A | No static export; not included by default |

### Run the full build

From portfolio root:

```bash
# 1. Build each demo (one-time or when demo changes)
cd RECENT-PROJECTS/chatgpt-dashboard && npm ci && npm run build && cd ../..
cd RECENT-PROJECTS/dev-agents-dashboard && npm ci && npm run build && cd ../..
# ... etc.

# 2. Build portfolio and copy demos
npm run build
```

---

## Customization

### Resume and contact

Edit `src/data/resume.ts`:

- `name`, `title`, `tagline`
- `email`, `linkedin`, `github`
- `experience` — roles and descriptions
- `skills` — tech list
- `resumePdf` — path to PDF in `public/` (e.g. `/Matt_Shade.pdf`)

### Projects

Edit `src/data/projects.ts`:

- Add or remove entries
- Use `external: true` and full URL for external sites
- Use `/projects/<slug>/` for hosted demos
- Order: internal first, external last

### Styling

- **Variables:** `src/index.css`
- **Hero:** `src/components/Hero.css`
- **Sections:** `src/App.css` and component-specific CSS files

---

## Scripts

| Command       | Purpose                                  |
|---------------|------------------------------------------|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Build portfolio and run copy-projects   |
| `npm run preview` | Serve `dist/` at http://localhost:4173 |

---

## Deployment (Netlify)

1. Push the repo to GitHub (or connect an existing repo).
2. In Netlify: **Add new site** → **Import an existing project**.
3. Use or verify:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy.

`netlify.toml` defines:

- Build command and publish directory
- SPA redirect for client-side routing
- Project subpaths and SPA fallbacks for `/projects/*`

---

## Browser support

Targets current Chrome, Firefox, Safari, Edge. Uses:

- CSS custom properties
- `backdrop-filter` for glass effects
- Modern JavaScript (ES2020+)
