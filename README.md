# Blue Star Barns demo source

Private interactive review example built with the current Sites scaffold, Vinext, React, TypeScript and the installed Shadcn/Base UI controls.

See [REVIEW-GUIDE.md](REVIEW-GUIDE.md) for routes, reviewer scenarios, limitations and production questions. The original brief is in HANDOFF.md.

## Run locally

Use Node.js 22.13 or later and the committed npm lockfile.

```sh
npm ci
npm run dev
npm run build
npx tsc --noEmit
node --experimental-strip-types scripts/demo-contracts.mjs
```

The dev command prints its local URL. The Sites production build outputs a Cloudflare-compatible Worker plus static client assets. There are no booking, email or payment API calls.

## Source map

- app/: five route entry points, metadata and shared styles.
- components/blue/home.tsx: homepage, navigation and reusable partner/home booking entry.
- components/blue/rental.tsx: selection, details, checkout simulation, confirmation and email preview.
- components/blue/staff.tsx: staff operations, bike editing, downtime, rates/hours and website text.
- components/blue/store.tsx: local session state and clone-before-commit transactions.
- components/blue/site.tsx: shared reviewer controls, route surface, partner example and optional WebMCP registrations.
- lib/demo-model.ts: pure fictional fixtures, time conversion, allocation and business rules, separate from presentation.
- scripts/demo-contracts.mjs: meaningful model behavior checks, no external services.
- public/lifestyle.png: generated illustrative photography, not an actual storefront.
- public/blue-star-barns-logo.jpg and public/blue-star-barns-chainring.jpg: user-supplied original logos, preserved without cropping or alteration.
- .openai/hosting.json: private Sites project binding. Contains no credential.

## Demo storage and production boundary

State uses one browser tab’s sessionStorage and resets on a later Eastern day. Model mutations are applied to a clone and committed only after validation, preserving prior state on a failure. This is not a server transaction or production concurrency guarantee.

The intended production host is Hostinger. A production implementation needs a suitable runtime/database, server-enforced inventory transactions and authentication, SMTP integration for booking notices, optional consent-based Reach integration, scheduled jobs, backups, payment verification if enabled, and operational monitoring. Do not assume this Worker build is compatible with an arbitrary Hostinger hosting plan.

No credential, secret, email service, payment processor or production inventory is included. Do not enter real customer details.
