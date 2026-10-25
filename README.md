# LuxeDrive

A responsive redesign concept for https://www.luxedrive.com.my, prepared on 24 October 2026. This is a standalone replacement frontend, not an edit to the existing NEWPAGES website. No domain or production hosting changes have been made.

## Preview

Requires Node.js 18 or newer. No package installation or build is required.

```sh
node server.mjs
```

Open http://127.0.0.1:4173. To check JavaScript syntax, run `node --check dist/app.js`. Deploy the `dist` directory to a static host. GitHub stores the source; hosting configuration and a domain cutover are separate steps.

## Features

- Black-and-gold editorial design, responsive layouts and mobile menu.
- Search, category filtering and sorting for 56 public vehicles from a 68-car imported stock snapshot.
- Accessible vehicle detail dialogs with photo galleries and PDF downloads.
- Vehicle-specific WhatsApp enquiries using the business's published number.
- Editable, illustrative flat-rate repayment calculator.
- Showroom contact information, directions and consignment enquiry.
- Local image assets, lazy-loaded listing photos and reduced-motion support.

## Content and maintenance

Edit the `defaults` array in `dist/inventory.js` to update stock, prices, specifications and listing URLs. This is a static snapshot, not a live inventory integration. The vehicle photos, logo and hero asset originate from LuxeDrive's public website and are retained for this redesign; confirm the business's rights before wider redistribution. Listing thumbnails use the original image CDN; imported gallery photos are bundled locally and loaded on demand. Google Fonts has local system-font fallbacks.

No made-up ratings, warranties, reviews or inspection promises are included. Unknown specifications are explicitly marked for enquiry. The BMW 420i has a year discrepancy in the source page, disclosed in the detail dialog. Prices, availability, vehicle details, company contact details and showroom hours require business confirmation before launch. The finance calculator illustrates a flat-rate formula and does not represent an approved financing offer.

WhatsApp links open a draft in the visitor's own WhatsApp session; this website does not send messages or collect leads in a database. No reservation, payment, email delivery or inventory CMS backend is included.

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for the review, priorities and source references.

## Vehicle PDF sheets

Every storefront listing and vehicle detail dialog has a Download PDF button. The PDF contains the current stock ID, asking price, specifications, status, outlet, listing notes, contact number and all vehicle photos (main photo first). It uses the current browser inventory, including preview admin edits. Photos blocked by their host or unavailable after 15 seconds are marked in the PDF and reported after download. jsPDF 4.2.1 is bundled locally under dist/vendor with its MIT license; no PDF service is required.

See [IMPORT.md](IMPORT.md) for the 25 October 2026 catalogue import and its validation.
