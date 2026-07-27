# MovePath

MovePath is a static React application that builds a private, dated relocation checklist for U.S. citizens moving from the United States to Germany.

## Current Route

The first release supports one route: United States to Germany. It does not claim broader international coverage.

## Stack

- React, TypeScript, Vite
- Vitest and jsdom
- ESLint and Oxlint
- Plain CSS
- GitHub Actions and GitHub Pages

## Local Development

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

## GitHub Pages Deployment

The deployment workflow is `.github/workflows/deploy-pages.yml`. It validates, builds, uploads the `dist` artifact, and deploys with official GitHub Pages actions.

The repository remote was not available when this app was created, so the Vite base path is controlled by `VITE_BASE_PATH`. For a project page, set the repository variable `VITE_BASE_PATH` to `/<repository-name>/`. For a user or organization page, leave it as `/`.

Update the canonical URL in `index.html` from the placeholder to the final GitHub Pages URL.

## Adding Another Route Pack

Create a new route data file under `src/data/routes/` that exports a `RouteRulePack`. Keep route-specific rules in data and keep the rule engine in `src/domain/ruleEngine.ts` unchanged unless the applicability model itself needs to grow.

## Rule Applicability

Each checklist rule has stable IDs, category, order, optional arrival-relative due date, documents, source references, and applicability conditions. Conditions are evaluated deterministically in the browser. A rule appears only when all of its conditions match the saved profile.

## Local Storage

MovePath stores questionnaire answers, generated metadata, schema version, and completed task IDs in `localStorage` under a namespaced key. It handles corrupt JSON, missing fields, outdated schemas, and test environments without `window` by falling back to a fresh state.

No backend, account, database, analytics SDK, advertising SDK, or server-side personal-data storage is used.

## Privacy Design

Answers and progress stay in the browser. JSON export is user-triggered and contains only export timestamp, app version, user answers, generated task IDs, route ID, and task completion state.

## Factual Content Verification

Administrative tasks include official or highly authoritative links. Content maintainers should review source URLs, rule wording, and `lastVerified` dates before releases. See `docs/content-maintenance.md`.

## Known Limitations

MovePath is organizational information, not legal, immigration, tax, financial, or insurance advice. It cannot account for every German city process, family circumstance, immigration route, tax edge case, health-insurance eligibility detail, or changing rule.

## Disclaimer

Confirm current requirements with the responsible authority or a qualified adviser before making decisions.
