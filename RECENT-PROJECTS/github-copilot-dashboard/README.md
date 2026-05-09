# GitHub Copilot Metrics Dashboard

A premium, executive-ready analytics dashboard for GitHub Copilot usage and seat activity. Built with **React + TypeScript + Recharts**, featuring an iOS **liquid glass** design aesthetic.

## ✨ Features

- **Live KPI Row** — Assigned Seats, Active Seats (1d/7d/30d), Activation Rate, Stickiness (DAU/MAU), Median Idle Time, Total Completions
- **Adoption Trend Chart** — Toggleable DAU/WAU/MAU area chart with animated line draw-in
- **"Where Copilot Lives"** — Donut + progress bars for VS Code vs JetBrains vs Neovim vs others
- **Surface Usage** — Stacked bar chart (Inline, Chat, PR Review, CLI, Other) over time
- **Surfaces Focus** — Tabbed detail view per surface: Chat | PR Review | Inline | CLI; includes WoW mover callouts
- **Engagement & Retention** — Activity bucket breakdown (<1d, 1–7d, 8–30d, 31–90d, inactive) + cohort stickiness estimate
- **At-Risk Seats** — List of users inactive 30+ days with last surface/editor
- **Users Table** — Sortable, filterable, paginated table with clickable row drawer
- **User Drawer** — Activity timeline, surface breakdown, local notes (localStorage)
- **Versions & Quality Signals** — Extension versions by editor + data hygiene warnings
- **Language Breakdown** — Top languages by completions + acceptance rate
- **Export** — CSV download of seat data; sharable URL (date/org/team persisted to query params)
- **Demo Mode** — Fully realistic mock data when no real token is configured

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
cd copilot-metrics-dashboard
npm install
npm run dev
```

Open **http://localhost:5173** (or the port shown in terminal).

### Demo Mode (default)

By default, the dashboard runs in **Demo Mode** with realistic synthetic data. No token required.

The purple banner at the top confirms: `🎭 Demo Mode — showing realistic mock data`.

---

## 🔑 Connecting to Real GitHub API

1. Create a **GitHub Personal Access Token** with `manage_billing:copilot` scope (org admin required)
2. Copy `.env.example` to `.env` (or edit `.env`):

```bash
VITE_GITHUB_TOKEN=ghp_yourtoken_here
VITE_DEMO_MODE=false
```

3. Restart dev server: `npm run dev`

> **Auth note:** The API client injects `Authorization: Bearer {token}` on every request. Org-level Copilot endpoints require admin or billing manager role.

---

## 📡 Endpoints Used

| Client Method | GitHub Endpoint | Description |
|---|---|---|
| `getSeatActivity(org, team?)` | `GET /orgs/{org}/copilot/billing/seats` | All assigned seats + last activity |
| `getUsageSummary(org, since, until)` | `GET /orgs/{org}/copilot/metrics` | Aggregated totals |
| `getUsageTrends(org, since, until, granularity)` | `GET /orgs/{org}/copilot/metrics/trends` | Daily/weekly time series |
| `getUsageBySurface(org, since, until)` | `GET /orgs/{org}/copilot/metrics/surfaces` | Breakdown by surface |
| `getUsageByEditor(org, since, until)` | `GET /orgs/{org}/copilot/metrics/editors` | VS Code vs JetBrains etc |
| `getUsageByLanguage(org, since, until)` | `GET /orgs/{org}/copilot/metrics/languages` | Per-language completions |
| `getPRReviewUsage(org, since, until)` | `GET /orgs/{org}/copilot/metrics/pr-review` | PR review adoption |
| `getChatUsage(org, since, until)` | `GET /orgs/{org}/copilot/metrics/chat` | Chat turns + users |
| `getActiveUsers(org, since, until, bucket)` | `GET /orgs/{org}/copilot/active-users` | Bucketed active user count |
| `getVersions(org, since, until)` | `GET /orgs/{org}/copilot/metrics/versions` | Extension version distribution |

All 9 endpoints are fetched in **parallel** via `Promise.all` on page load.

### Resilience

- **5-minute in-memory cache** + request deduplication (concurrent identical fetches share one promise)
- **3-attempt retry** with exponential backoff for transient errors
- **Rate limit detection** — HTTP 429 → reads `Retry-After` header → user-facing toast notification
- **Loading skeletons** during fetch, **error state** with retry button, **empty state** guidance

---

## 🔄 Demo Mode

Demo Mode is enabled when `VITE_DEMO_MODE=true` (or when `VITE_GITHUB_TOKEN` is absent). All API calls return realistic mock data from `src/data/mockData.ts` that mirrors the exact shapes of the real endpoints.

Mock data includes:
- 50 named seats with randomised activity dates, editors, surfaces, teams
- 90 days of daily usage trends (seeded RNG — deterministic)
- Surface, editor, language, PR review, chat, and version breakdowns

To **disable** Demo Mode: set `VITE_DEMO_MODE=false` in `.env`.

---

## 📤 Export Behavior

| Export Type | How |
|---|---|
| **CSV (Seat Table)** | Click ⬇ Export in the header → downloads `copilot-seats-{org}-{date}.csv` |
| **Columns** | Login, Team, Last Activity, Days Since, Bucket, Surface, Editor |
| **PNG snapshot** | Use browser Print → Save as PDF, or browser DevTools → screenshot |

---

## 🔗 Sharable Links

Org, team, and date range selections are persisted to URL query parameters:

```
http://localhost:5173/?org=demo-org&team=platform&range=30d
```

Share the URL or bookmark it for instant filter restoration.

---

## 📁 Project Structure

```
src/
  api/          # API client with caching, retry, demo mode
  components/
    AtRisk/     # At-risk seats panel
    Charts/     # Adoption, Surface, Editor charts
    Engagement/ # Retention & bucket breakdown
    Header/     # Nav, selectors, date range
    KPICard/    # KPI cards + row
    Language/   # Language breakdown
    Surfaces/   # Surface tabs focus
    UsersTable/ # Table + user drawer
    Versions/   # Version quality panel
  data/         # Mock data
  store/        # Zustand state + URL sync
  types/        # TypeScript API types
  utils/        # Metrics calc, formatting, CSV
```

---

## 🛠️ Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 19 + TypeScript | Component model + type safety |
| Build | Vite 7 | Sub-second HMR |
| Charts | Recharts | React-native, SVG, animated |
| State | Zustand | Minimal, URL sync friendly |
| Date utils | date-fns | Tree-shakable, no moment |
| Styling | Vanilla CSS + CSS custom properties | Full liquid glass control |

---

## ⚙️ Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server (HMR) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
