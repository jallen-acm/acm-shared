# acm-shared

Code every American Cedar & Millwork app and site imports, so a change lands
everywhere at once. Plain JavaScript only, no build step, **nothing native** —
that keeps the customer app's over-the-air update path open for every change
made here.

| Module | What |
|---|---|
| `theme.js` / `theme.css` | Brand colors and font stacks (sampled from the logo). Native code uses `COLORS` + `FONT_FAMILIES`; sites `import 'acm-shared/theme.css'`. |
| `permissions.js` | `can(session, capability, { enableOrdering })` — WebTrack gating from the group-resolved `Rights` array. `isEmployeeSession`. |
| `orderStatus.js` | BisTrack `StatusID` / `SaleTypeID` meanings, friendly labels, the order tracker steps. |
| `pricing.js` | Per-lineal-foot display math. |
| `reorder.js` | Turn past transaction lines into cart adds. |
| `format.js` | `money`, `shortDate`. |
| `bistrack.js` | Transaction type enums, `agingAmount` (the aging field is `ValueOfTransactions`, not `Balance`). |
| `assets/` | Canonical logo files. Apps keep their own copies where the platform needs them (Expo icon/splash, site `public/`); copy from here. |

Consumers: `acm-customer-app`, `acm-website`, `acm-crm-app`, `acm-crm-website`,
`acm-crm-api` (constants only).

## Installing

Local development uses a file dependency so edits here show up immediately:

```json
"acm-shared": "file:../acm-shared"
```

All ACM repos are private, so a deploy (Render, EAS Build) cannot fetch this
from GitHub without credentials. **Before the first deploy that includes the
shared package, pick one:**

1. **GitHub Packages** (private npm registry, free for this account). Publish
   `@jallen-acm/acm-shared`; consumers get an `.npmrc` that reads
   `NPM_TOKEN` from the environment. Render and EAS both document this.
2. **Make this repo public.** Then `"acm-shared": "github:jallen-acm/acm-shared#v0.1.0"`
   works everywhere with no tokens. Nothing in here is secret.

## Tests

```bash
npm test
```
