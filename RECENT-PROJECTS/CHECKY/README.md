# Checky — AP-Adjacent Style Validator

This project is a Next.js (App Router) + TypeScript web application for an AP-adjacent style validator.

**Important:** This tool does **not** include or reproduce the AP Stylebook. It uses configurable heuristics and internal rules.

## Features
- AP-adjacent validation report with scores, findings, and annotated text
- Pluggable rule configuration in `rules/config.json`
- Exportable JSON reports

## Quick start
```bash
npm install
npx prisma migrate dev
npm run dev
```

Create a `.env.local` file:
```
OPENAI_API_KEY=your_key_here
```

## Rules engine
Rules live in `src/lib/rules/` and are driven by `rules/config.json`. The rules are **heuristics** that you can customize for your organization. You can add or change rules without changing core logic by:
1. Editing `rules/config.json` for preferences (Oxford comma, numerals, etc.)
2. Adding new rules to `src/lib/rules/registry.ts` using the `Rule` interface

If you plan to integrate licensed AP Stylebook rules later, keep those in a separate rule pack and load them alongside the internal rule registry.

## API
### `POST /api/validate`
```json
{ "text": "article...", "configOverrides": { "preferPercentSymbol": true }, "useLLM": true }
```

Response is strict JSON:
```json
{
  "score": 0,
  "categories": { "Punctuation": { "score": 80, "count": 2 } },
  "findings": [
    {
      "id": "rule-id",
      "severity": "definite",
      "category": "Punctuation",
      "start": 0,
      "end": 10,
      "snippet": "text",
      "suggestion": "fix",
      "rationale": "why",
      "confidence": 0.5,
      "rule_id": "rule-id"
    }
  ],
  "annotatedText": "markdown or html",
  "meta": { "model": "optional", "createdAt": "ISO timestamp" }
}
```

## Security + limitations
- This tool does **not** reproduce or quote the AP Stylebook.
- Findings are heuristic and should be reviewed by a human editor.
- LLM refinement never creates new findings; it only updates existing ones.
- Keep `OPENAI_API_KEY` in `.env.local` and never commit it.

## Tests
```bash
npm run test
```
