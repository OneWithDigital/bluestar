# Editing Blue Star Barns

Repository: https://github.com/OneWithDigital/bluestar

Live demonstration: https://bluestar.onewithdigital.com/

## Get started

Install Node.js 24 LTS and Git. Clone the private repository using a GitHub account with access:

```sh
git clone https://github.com/OneWithDigital/bluestar.git
cd bluestar
npm ci
npm run dev:hostinger
```

Open the local URL printed by Vite. The Hostinger development build uses the same application code as the live site. It requires no service credentials. Use a single browser tab when switching between customer, staff, and partner views so the demonstration inventory stays shared.

## Where to edit

| Change | File or folder |
| --- | --- |
| Homepage, header, logos, footer, quick booking form | `components/blue/home.tsx` |
| Colours, typography, spacing, responsive layout | `app/globals.css` |
| Rental picker, contact form, payment simulation, confirmation/email preview | `components/blue/rental.tsx` |
| Staff reservations, inventory quantities, maintenance, prices/hours/content editors | `components/blue/staff.tsx` |
| Demo fixtures, rates, stock, availability and payment calculations | `lib/demo-model.ts` |
| Reviewer controls, partner page, route dispatch | `components/blue/site.tsx` |
| Browser-session persistence | `components/blue/store.tsx` |
| Original logos and generated imagery | `public/` |
| Hostinger HTML metadata and self-hosted fonts | `hostinger/` |
| Hostinger build and route adapter | `vite.hostinger.config.ts`, `hostinger/navigation.ts`, `hostinger/.htaccess` |

The staff content/rate editors change only the current browser session. To make a lasting default change, update the fixtures in `lib/demo-model.ts`, commit the source, rebuild, and publish. Existing tabs may retain their previous demo data until Reset demo or the next Eastern day.

## Validate and package

```sh
npm run check
npm run preview:hostinger
```

Review `/`, `/rent`, `/staff-demo`, and `/partner-demo`. Create a fictional booking to check its confirmation. Verify shared availability, pickup balance, mobile navigation and the simulated payment cases. The automated checks cover the inventory/payment model; they do not replace browser review.

On Windows, macOS or Linux:

```sh
npm run package:hostinger
```

The Node.js packaging script requires no separate ZIP utility and includes `.htaccess` with no enclosing directory. The production web root needs `index.html`, `.htaccess`, the `assets` directory, and public artwork.

## Publish a reviewed change

Commit and push the editable source to GitHub. Deploy only the built ZIP to the **bluestar.onewithdigital.com subdomain**, through the Hostinger connector or that subdomain's hPanel file tools. The parent `onewithdigital.com` website has a different document root and must not be overwritten.

Pushing to GitHub alone does not update the live site. No automatic deployment or GitHub Actions workflow is configured. Hostinger access remains separately authenticated; no token belongs in this repository, its history, or the static build.

After publishing, check HTTPS and direct visits to all routes, then make one fictional reservation and find it in staff in the same tab. Keep the previous working ZIP as a rollback package. See `HOSTINGER-DEPLOYMENT.md` for hosting details.

## Boundaries

Keep the preview notice and fictional data labels until a production implementation is approved. Current inventory is browser-session data; the staff demo is public. Authentication, shared server storage, SMTP, Reach, live DripOS/payment integrations and cross-domain partner embeds are not implemented. See `REVIEW-GUIDE.md` for remaining business decisions.
