# Blue Star Barns — website example

Private review: https://blue-star-barns-coffee-bikes-demo.erik899058.chatgpt.site

Published Hostinger demo: https://bluestar.onewithdigital.com (public demonstration; still uses fictional data only).

This is a fictional-data layout and interaction example, with pay at pickup through DripOS selected by default. No production services are connected.

## Route guide

| Route                  | What to try                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| /                      | Coffee and cycling homepage. Date/time/duration entry, sample bike categories, sample café menu, visit details.                                                                            |
| /rent                  | Choose one or more bikes and sizes, enter fictional contact details, acknowledge the sample policy, and confirm.                                                                           |
| /reservation/{demo-id} | Open the link created by a booking. Check the ride, amount due, payment status and matching email preview.                                                                                 |
| /staff-demo            | Today, Reservations, Bikes, Prices & hours, and Website content. Open a reservation to record payment, check out, return, edit quantities, cancel, mark no-show or simulate a full refund. |
| /partner-demo          | Fictional lodging partner with a booking button and compact widget. Both retain the partner source and use the same sample fleet.                                                          |

Use the reviewer bar to switch views, preview full payment or a sample 20% booking deposit, and reset the demo. Keep your review in one browser tab. Customer and staff changes share that tab’s session storage; separate tabs, browsers and people do not share a production database. Returning on a later Eastern calendar day starts fresh fixtures.

## Suggested review

1. Start with Reset demo and the default Pay at pickup setting.
2. Reserve two available bikes for tomorrow. The confirmation should say “Demo reservation confirmed,” “Unpaid,” and show the pickup balance.
3. Open the reservation in Staff demo. Record a simulated pickup payment; reservation status stays Confirmed while payment changes to Paid.
4. Use today’s seeded rental to test checkout/return. A future reservation cannot be checked out before its pickup time. Bikes already out remain blocked until staff record return, followed by turnaround.
5. Try changing the date, duration, size or quantity. Prices recalculate and unavailable selections are rejected.
6. In Bikes, edit stock for a type and size, for example Comfort bike / Large to 6 total. Reserve 4 together and verify that 2 remain available for the same time. Add stock to the same group without creating individual bike entries. Schedule downtime for a quantity of bikes; only that quantity is blocked. Reductions below committed reservations or maintenance are rejected.
7. Select Payment preview → 20% deposit or Full payment. Try failure, cancellation and success. Failed/cancelled checkout creates no reservation. Successful checkout rechecks bikes before confirming.
8. Use the partner widget and find “Example lodging partner” in Staff demo.
9. Edit sample prices, hours or café text, then revisit the customer site. Reset when finished.

## What is simulated or limited

- Fleet, sizes, prices, people, booking IDs, payment records and operating rules are fictional fixtures. Sample prices exclude any applicable taxes.
- The starting sample fleet has 12 bikes in six type-and-size stock groups (2 per group), across Comfort, Step through e-bike and Hybrid categories. Each group has an editable total quantity, up to 100 for this demo. Matching bikes are interchangeable; there are no individual bike assignments. This follows the later request for quantities in place of the original handoff assumption about individual bikes.
- Reservations, staff edits, stock quantities and history work locally in the browser session. This does not prove safe concurrent booking across devices or users.
- DripOS is not contacted. “Record pickup payment” records a demo event only; there is no automatic synchronization or reconciliation.
- Online checkout never requests card data and has no processor integration. There are no temporary checkout holds; availability is checked again on successful simulation. Failure/abandonment leaves no held inventory.
- The deposit is a sample 20% booking deposit, not a refundable damage deposit. Staff refund simulation refunds the entire recorded payment; partial refunds are not implemented.
- Booking emails are previews only. No email, reminder, cancellation notice, marketing subscription or promotional campaign is sent. A real reminder scheduler is not implemented.
- Cancellation and no-show immediately release demo inventory; refund status is a separate action. Final cancellation/no-show rules remain a business decision.
- Staff demo is deliberately open, including on the public Hostinger demonstration. It has no independent staff authentication, roles, audit security or production database. Each visitor sees only that visitor's browser-session fixtures and edits.
- The partner widget is an in-page layout and referral demonstration. A real cross-domain embed, commission accounting and partner payouts are not implemented.
- An imagegen-edited transparent bird-and-handlebars cutout appears beside readable website text in the customer header and partner page. Its surrounding background and embedded lettering are removed; the bird retains light interior detail. This is an edited raster interpretation, and the original supplied logo is retained in the source. The supplied business-card chainring logo appears on the homepage photo, footer and staff sidebar. Both original JPEGs are included unchanged in the source. The palette explores charcoal, warm cream, teal, orange and yellow from the business card; teal is darkened for readable links and staff controls. The generated lifestyle photo is illustrative, not an actual property or product photo. Category cards use neutral bicycle icons rather than claims about actual models.
- The Visit section intentionally leaves coffee hours and bike hours separate and unconfirmed.
- The source retains the Sites/Vinext Worker build and adds a separate ready-to-upload Hostinger static demo build. It reuses the same application components, stock model, artwork and fonts. It is not a production reservation backend.

## Production questions

- What are the actual bike models, grouped quantities, sizes, maintenance rules and rental inclusions?
- What are the rental rates, durations, taxes, deposit choices, pickup windows, turnaround time and closure dates?
- What are the approved café menu, café hours, rental hours, contact details and business photos?
- What rules govern pickup, late returns, cancellation, no-shows, refunds, rider eligibility and rental agreements?
- Which Hostinger plan will support the chosen runtime, database, scheduled jobs, backups and expected traffic?
- Which authenticated Hostinger SMTP mailbox will send transactional confirmations, changed-booking notices, cancellations and reminders, and are its limits suitable?
- Is optional Hostinger Reach desired for separately opted-in promotional subscribers, and what does the actual plan support?
- Should online payments be added, with a deposit or full payment, and which processor and reconciliation process should be used?
- What are the partner site platforms, embedding requirements, allowed origins and referral attribution expectations?
- Who will have staff access, and who will own support, backups, monitoring and ongoing costs?

## Validation

September 21 follow-up: see [SITE-REVIEW-2026-09-21.md](SITE-REVIEW-2026-09-21.md) for the current review, five functional corrections, additional regression tests, and prioritized ideas. The current model suite has 25 checks. Editable source and setup instructions are in the private [GitHub repository](https://github.com/OneWithDigital/bluestar).

The Hostinger deployment was verified on September 9, 2026 (Eastern): the separate static build and TypeScript check passed, all 21 model checks passed, and all five routes served the new application over validated HTTPS. A live two-bike booking confirmed the correct unpaid pickup balance and appeared in staff with matching quantities and details. The Hostinger homepage had no horizontal overflow at 390px; all images loaded and the intended fonts were applied. Test data was reset afterward. See HOSTINGER-DEPLOYMENT.md for the build and deployment details.

The production build and TypeScript check passed. Twenty-one focused behavior checks cover shared stock quantities, peak concurrent demand, larger group bookings, stock reductions, partial maintenance, duplicate selections, migration of existing demo sessions, Eastern time, turnaround, cancellation, no-show, returns, changed bookings, deposit/payment status, closure settings and invalid dates.

Browser review verified a two-bike customer reservation, matching email preview, the same booking in staff, recorded pickup payment, partner form selection carry-through, shared reduced availability, and simulated deposit failure/cancellation/success. Mobile layouts were checked at a 390px viewport; desktop booking controls were visible in the first 1440×900 screen. Both WebMCP tools were checked with valid and invalid inputs.

## Content sources

Business identity, address and coffee/bike positioning were checked against the [Saugatuck Douglas tourism listing](https://saugatuck.com/business/blue-star-barns/). Facebook content was unavailable through the reference fetch, so no private or inaccessible posts were used. The supplied handoff remains the source for the fictional fixtures and production preferences.

Validation limit: 200% browser/text zoom was not verified because the available browser control did not accept zoom shortcuts. Mobile dimensions, keyboard dialog dismissal and the tested form journeys were checked. Production accessibility review is still required.
