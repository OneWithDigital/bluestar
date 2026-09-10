# Blue Star Barns demo source

Interactive review example built with the Sites scaffold, Vinext, React, TypeScript and the installed Shadcn/Base UI controls. A separate static build publishes the same demo on Hostinger.

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

## Hostinger build

```sh
npm run build:hostinger
npm run preview:hostinger
```

Upload the contents of `dist-hostinger/` to the `bluestar.onewithdigital.com` document root, with `index.html` and `.htaccess` at that root. Include the dotfile: it sends direct links such as `/rent`, `/staff-demo`, `/partner-demo`, and `/reservation/{demo-id}` to the same app. The source tree, package files, Sites Worker, and connector credentials are not part of this upload.

`vite.hostinger.config.ts` uses the existing components and styles, self-hosted copies of the same fonts, and a small adapter for read-only URL hooks. It does not change the private Sites build or add a server/database. See [HOSTINGER-DEPLOYMENT.md](HOSTINGER-DEPLOYMENT.md).

## Source map

- app/: five route entry points, metadata and shared styles.
- components/blue/home.tsx: homepage, navigation and reusable partner/home booking entry.
- components/blue/rental.tsx: selection, details, checkout simulation, confirmation and email preview.
- components/blue/staff.tsx: staff operations, grouped stock quantities, partial maintenance downtime, rates/hours and website text.
- components/blue/store.tsx: local session state and clone-before-commit transactions.
- components/blue/site.tsx: shared reviewer controls, route surface, partner example and optional WebMCP registrations.
- lib/demo-model.ts: pure fictional fixtures, time conversion, pooled stock availability and business rules, separate from presentation.
- scripts/demo-contracts.mjs: meaningful model behavior checks, no external services.
- public/lifestyle.png: generated illustrative photography, not an actual storefront.
- public/blue-star-barns-bird.png: transparent cutout created with built-in imagegen, used beside live website lettering.
- public/blue-star-barns-logo.jpg and public/blue-star-barns-chainring.jpg: user-supplied original logos, preserved without cropping or alteration.
- .openai/hosting.json: private Sites project binding. Contains no credential.

## Demo storage and production boundary

Matching bikes are stored as one type-and-size record with a quantity. Reservations and maintenance consume quantities at peak concurrent usage; stock reductions protect current and future commitments. Existing v3 demo sessions migrate to the grouped v4 model while preserving reservations and payments.

State uses one browser tab’s sessionStorage and resets on a later Eastern day. Model mutations are applied to a clone and committed only after validation, preserving prior state on a failure. This is not a server transaction or production concurrency guarantee.

The demonstration is prepared for Hostinger static hosting. A production reservation implementation still needs a suitable runtime/database, server-enforced inventory transactions and authentication, SMTP integration for booking notices, optional consent-based Reach integration, scheduled jobs, backups, payment verification if enabled, and operational monitoring. Hosting this demo does not supply those production features.

No credential, secret, email service, payment processor or production inventory is included. Do not enter real customer details.
