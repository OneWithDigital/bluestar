# Hostinger demo deployment

Destination: https://bluestar.onewithdigital.com

Published September 9, 2026 (Eastern). The deployed archive is `blue-star-barns-hostinger_20260909_230000.zip`. The existing Hostinger default page was replaced only on this subdomain; the parent website and DNS records were not changed.

Updated September 21, 2026 (Eastern) following the functional review in `SITE-REVIEW-2026-09-21.md`. The source and build instructions are maintained at https://github.com/OneWithDigital/bluestar. Use `npm run package:hostinger` to create a new dated archive after edits. The September 9 ZIP remains a rollback snapshot, not the latest source.

The authorized Hostinger destination is an existing subdomain under `onewithdigital.com`. Deploy only the built static archive to that subdomain. Do not upload into the parent site's root.

## Build and package

Run `npm ci` when dependencies are absent, then `npm run build:hostinger`. Zip the contents of `dist-hostinger` with `index.html` and `.htaccess` at the archive root. The package includes only compiled HTML/CSS/JavaScript, fonts, and public artwork. No Hostinger token, site source, environment file, payment service, or email connection is included.

The `.htaccess` rule serves the app for direct route requests. The Vite configuration maps the existing read-only navigation hooks to browser URLs. The original Sites build and its manifest stay intact.

The HTML entry point uses `Cache-Control: no-cache` so browsers revalidate it for updates. If a tab was opened before this header was deployed, refresh it once. Public artwork and fingerprinted build assets remain cacheable.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Coffee and cycling homepage |
| `/rent` | Bike quantities, sample customer details, pay at pickup or simulated checkout |
| `/reservation/{demo-id}` | Confirmation and email preview for a booking created in the same browser tab |
| `/staff-demo` | Reservation operations, grouped inventory quantities, sample prices and content |
| `/partner-demo` | Fictional partner booking link and widget |

All state remains in the current browser tab's session storage. Navigation and page reloads in that tab retain edits; separate tabs/devices do not share inventory. Existing data from the private Sites domain does not transfer automatically to this domain.

The staff demo is publicly reachable and contains fictional fixtures. The page metadata requests no search indexing. No real reservation, charge, email, or newsletter subscription is created. Pay at pickup through DripOS remains the default demonstration choice; DripOS is not contacted.

See REVIEW-GUIDE.md for scenarios, limitations, and remaining production questions. A real launch still requires actual business data, staff authentication, a server-side inventory database, booking email integration, and final payment/policy decisions.

## Deployment verification

The Hostinger build, TypeScript check, and all 21 reservation/inventory behavior checks passed. HTTPS requests with certificate validation returned the new application on all five routes, including direct nested-route requests. A live browser test reserved two Comfort bike / Large units, confirmed the unpaid $50 pickup balance, and opened the same reservation in the staff dashboard. The homepage had no horizontal overflow at 390px; all five images loaded and the intended DM Sans/Fraunces fonts were applied. Test data was reset and the browser viewport restored after review.
