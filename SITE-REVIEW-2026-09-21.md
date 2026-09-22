# Site review — September 21, 2026

Reviewed https://bluestar.onewithdigital.com/, its local source, and the reservation model. The site remains a fictional-data demonstration, not a production booking system.

## Issues corrected

1. **Decimal payment arithmetic:** rates such as $19.95 multiplied by three could produce a floating-point total below the displayed $59.85, rejecting the displayed payment. Other rates left a tiny residual balance and prevented checkout. Totals, payments and balances now use integer cents for arithmetic; existing floating-point residues are also handled.
2. **All-day reservations versus closing time:** changing closing from 18:00 to 17:00 could be accepted despite an existing day rental promised until 18:00. Conflicting changes are now rejected. Extending hours preserves the existing booked return time.
3. **Invalid clock values:** the model accepted hour strings with impossible minutes. It now validates actual 24-hour times.
4. **Upcoming pickup ordering:** the staff dashboard used creation order for its next four reservations. It now sorts by pickup time first.
5. **Cancelled reservation wording:** cancelled/refunded reservations still displayed a pickup amount due. Those views now state that no pickup is scheduled and label the remaining arithmetic amount for policy review. No cancellation charge or refund policy is invented.

Four regression scenarios were added for closing-time conflicts, invalid times, decimal rates/partial payments, and legacy payment residues. The suite has 25 behavior checks.

The Hostinger HTML now requests cache revalidation so subsequent deployments do not keep old route HTML in the browser while other pages load the new build. Fingerprinted JavaScript and CSS assets remain cacheable.

## Review evidence

- Desktop homepage: images loaded, primary navigation and booking entry worked; no captured console errors on the inspected homepage.
- Customer booking: two identical Comfort/Large bikes produced a $50 unpaid reservation. Missing required details/policy acknowledgment prevented progress. Confirmation and email preview matched the chosen bikes and balance.
- Staff: the customer reservation appeared in the same session; recording pickup payment changed payment to Paid while status remained Confirmed; early checkout was rejected.
- Partner/mobile: widget date and time reached the picker with the partner source. A $45 e-bike reservation simulated a $9 deposit and $36 pickup balance, and the source appeared in staff.
- Checkout: simulated failure, cancellation and retry/success were exercised. No real payment or email was involved.
- Cancellation and separate full refund actions produced Cancelled/Refunded states. This exposed the wording problem corrected above.
- Inventory: reducing stock below an active rental was rejected. Adding and removing quantity-based maintenance worked.
- At 390px, inspected confirmation and inventory pages fit the viewport without horizontal page overflow; the checkout dialog remained usable. The policy checkbox worked with keyboard and in the mobile flow.

The corrected Hostinger build, TypeScript check and 25 behavior checks passed. The ZIP was opened independently and all 14 entries matched the build by SHA-256; `index.html` and `.htaccess` were at the root. All five public routes served the new bundle over validated HTTPS. After a refresh, the live cancelled confirmation displayed the corrected policy-review wording.

The automated suite additionally covers larger stock groups, peak concurrent demand, turnaround, returns, no-shows, edits, closures, payment gates and old-session migration. Browser controls were occasionally interrupted and timed out; affected steps were resumed from a fresh page observation. This was a focused desktop/mobile review, not an exhaustive audit across Safari, Firefox, physical devices, screen readers or 200% text zoom.

## Recommended improvements

| Priority | Improvement | Benefit |
| --- | --- | --- |
| Before real bookings | Staff login, shared database and server-enforced inventory transactions | Customer and staff inventory persists across devices and prevents concurrent overbooking. |
| Before real bookings | Confirm actual bikes, sizes, inclusions, pricing/taxes, café/rental hours and cancellation rules | Replaces placeholders and makes the reservation promise clear. |
| High | Actual bike photos with simple fit/height guidance | Helps customers choose a comfortable bike and reduces counter questions. |
| High | Show alternative pickup times or available sizes when a selection is sold out | Gives customers a clear next step instead of making them guess. |
| High | Staff calendar with overdue-return indicators and a pickup/return checklist | Makes busy-day operation easier and draws attention to bikes still out. |
| Medium | Collapsible reviewer controls and a cleaner customer presentation mode | Gives more room to the brand on mobile while preserving demo warnings. |
| Medium | A few owner-approved local ride suggestions and a concise rental FAQ | Strengthens the coffee-and-cycling identity and answers common questions. |
| Later | Transactional email, calendar download and a manage-booking link | Helps customers remember pickup details; requires an approved backend and policies first. |

Pay at pickup should remain the default unless the business chooses otherwise. Keep marketing opt-in separate, and connect Reach only after consent and sender details are confirmed. These ideas are recommendations, not additional production features silently enabled by this review.
