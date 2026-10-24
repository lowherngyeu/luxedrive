# Inventory admin — preview

Open https://lowherngyeu.github.io/luxedrive/admin (GitHub Pages redirects to `/admin/`). No login is required in preview mode, as requested. The footer's Admin link opens it. The legacy `/admin.html` route also works.

## What works

- Add, edit and delete vehicles, including up to 12 photos per car. Upload several JPEG, PNG or WebP images together (up to 10 MB each), or add HTTPS photo URLs. Select **Set as main** to choose the listing preview image. Remove individual photos; removing the main photo selects the first remaining photo. Vehicle details show a selectable thumbnail gallery. Existing single-photo listings and backups are upgraded automatically.
- Set price, make, model, year, category, outlet, availability, specifications, original listing link and notes.
- Filter inventory by status/outlet, search, export a JSON backup, import a backup, or restore the original six vehicles.
- Available and reserved cars appear on the storefront in the same browser. Sold and draft cars remain in admin only. Cross-tab updates are supported.
- New Setia Alam listings direct WhatsApp enquiries to that outlet's phone number.

## Preview storage

All changes use localStorage under `luxedrive.inventory.preview.v1` on this website's origin. They are not committed to GitHub or shared with other visitors or devices. Clearing browser data removes edits; export a backup first. Large photo collections can fill browser storage; saving reports errors without discarding the last saved inventory.

## Production login

This preview does not contain a working production login, backend or shared database. `PREVIEW_MODE` in `dist/inventory.js` controls preview administration. Setting it to false blocks the admin workspace and browser writes; it is not an authentication system. Before production use, connect server-enforced administrator authentication, permissions, an inventory database and image storage. Do not treat a hidden URL or a client-side password as security. No credentials or secrets belong in the static frontend.
