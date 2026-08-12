# Matt Shade — Engineering & Design Portfolio

<div align="center">
  <p><em>Interactive portfolio built with React, Vite, Three.js, and a liquid-glass design system.</em></p>

  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Netlify](https://img.shields.io/badge/Netlify-Deployed-00AD9F?logo=netlify&logoColor=white)](https://www.mattshade.com/)
</div>

---

## Overview

Single-page portfolio with an origami forest WebGL background, scroll-driven scene motion, nav-triggered world rotation, embedded case-study projects, inline contact, and a downloadable resume. Storybook documents UI components separately.

**Live site:** [mattshade.com](https://www.mattshade.com/)

---

## Features

| Area | What it does |
|------|----------------|
| **Origami aviary** | 360° forest ring, birds, bats, and origami cat — scroll parallax, pointer parallax, responsive tuning |
| **Nav rotation** | Random 50–90° forest spin on section nav with smooth camera framing and landing ease |
| **About** | Glass panel over the forest (forest-only mode — no cavern/vine descent on mobile) |
| **Contact** | Inline `#contact` section with validation; `/contact` redirects to `/#contact` |
| **Projects** | Embedded builds under `/projects/*` aggregated at deploy time |
| **Landscape gate** | Phones/tablets in portrait see a rotate prompt before the full 3D experience |
| **Resume** | On-site resume page + `public/MattShade.pdf` download |
| **Storybook** | Component docs at `/storybook/` after build |

---

## Tech stack

- **React 18** + **TypeScript** + **Vite 6**
- **Three.js** — origami line-art scenes (aviary, about transition helpers)
- **React Router 7** — section routing and project overlays
- **Framer Motion** — UI motion
- **Vanilla CSS** — custom properties, glass panels, blueprint grid language
- **Vitest** + **Testing Library** — unit tests (≥80% coverage on testable `src/` modules)
- **Storybook 10** — visual component catalog

---

## Project structure

```text
src/
├── components/          # UI + Three.js scene modules
│   ├── OrigamiAviaryBackground/   # Forest scene, birds, bats, nav rotation loop
│   ├── ContactForm.tsx            # Inline contact with Netlify / Formspree / mailto fallback
│   └── LandscapeGate.tsx          # Mobile portrait gate
├── content/             # About copy and block rendering
├── data/                # Resume source of truth + JSON-LD
├── pages/               # Route shells (HomePage, ResumePage, Contact redirect)
├── utils/               # Shared validation and navigation helpers
├── world/               # Nav rotation + About descent bridges (non-React)
└── test/                # Vitest setup

public/
├── MattShade.pdf        # Downloadable resume (replace + bump ?v= in resume.ts)
└── projects/            # Static or copied embedded project assets

scripts/
├── build-portfolio-projects.cjs   # Build embedded RECENT-PROJECTS
└── copy-projects.cjs              # Copy outputs into dist/
```

---

## Development

```bash
# Install
npm install

# Local dev (portfolio + /projects/* + /storybook/ when built)
npm run dev

# Portfolio-only production build (no Storybook)
npm run build:portfolio

# Full Netlify build (projects + Vite + Storybook + copy)
npm run build

# Unit tests
npm test

# Unit tests with coverage (80% threshold on testable src/)
npm run test:coverage

# Storybook
npm run storybook
```

---

## Resume PDF

1. Export your ATS PDF and copy it to `public/MattShade.pdf`.
2. Bump the cache-buster in `src/data/resume.ts`:

   ```ts
   resumePdf: '/MattShade.pdf?v=2',
   ```

3. Rebuild and deploy.

Optional generators: `npm run generate:resume-ats` / `generate:resume-designer`.

---

## Deployment (Netlify)

1. **Embedded projects** — `scripts/build-portfolio-projects.cjs` builds each entry in `scripts/portfolio-projects.cjs`.
2. **Portfolio** — `vite build` outputs the main app.
3. **Storybook** — bundled into `dist/storybook/`.
4. **Copy** — `scripts/copy-projects.cjs` merges project `dist/` folders into the final deploy.

`netlify.toml` handles SPA redirects and `/projects/*` deep links.

---

## Testing notes

- **Unit tests** (`npm test`) cover navigation math, form validation, resume JSON-LD, scroll/rotation config, and key React components.
- **WebGL scene shells** (large Three.js entry components) are excluded from coverage thresholds — their logic lives in tested sibling modules (`sceneAnchor`, `navRotationConfig`, `craneMotion`, etc.).
- **Storybook browser tests** run via the Storybook Vitest addon (`vitest --project storybook`).

---

<div align="center">
  <sub>Built with intent by Matt Shade. © 2026</sub>
</div>
