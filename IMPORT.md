# LuxeDrive catalogue import - 25 October 2026

One-time import from the original public Unregistered and Consignment categories, including all three Consignment catalogue pages.

- Found 69 distinct stock IDs. Imported 68: 19 Unregistered and 49 Consignment.
- 50 available, 5 incoming, 1 reserved (source: BOOKED), and 12 sold. Sold stock is visible only in admin.
- Skipped sold Ferrari F8 Tributo stock 6660520 because the source publishes no asking price. No price was invented.
- Copied 792 photos locally, up to 12 per car. Archives are loaded when opening a car or downloading its PDF; listing thumbnails still use the original CDN.
- Prices, make/model, year, specifications, mileage and description bullets come from the corresponding source listing. Unknown mileage remains unknown; miles remain miles.
- Conflicting source years and engine capacities are disclosed in listing notes. Source details and status still require business confirmation.
- Existing browser preview edits take precedence. Newly imported stock is merged without replacing those edits or restoring previously deleted cars. Future saves record seed IDs to preserve deletions.
- Firebase is not connected. This is a published stock snapshot; future source edits do not synchronize automatically. Admin edits remain browser-local.
- Original listing URLs are retained for traceability in admin and the audit file; no original-listing link is shown in public car details or PDFs.

See data/luxedrive-import-2026-10-25.json for per-stock provenance, specification fields, photo counts and skipped records.

Validation: JavaScript syntax checks and stock/photo validation passed for all 68 cars and 792 archived photos. Migration checks preserve existing edits and deleted stock. Browser search returned two Caymans and reset to 56 public cars. An imported Defender PDF downloaded successfully with the correct price, two pages and all 12 photos on page 2; its gallery was visually reviewed.

