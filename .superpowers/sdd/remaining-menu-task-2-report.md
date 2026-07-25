# Remaining Admin Menu Task 2 Report

Date: 2026-07-25

## Delivered

- Added dedicated `/anjungan_menu` and `/anjungan_pengaturan` App Router pages, client managers, and server actions.
- Added tenant-scoped Anjungan menu create/update/delete operations with exact-module `b` page access, `u` create/update/reorder access, and `h` delete access.
- Added atomic menu reordering. The transaction reads the current tenant menu set, requires the submitted order to contain exactly that set, and rolls back if any scoped position update does not affect one row.
- Added a strict menu allowlist for `nama`, `link`, `link_tipe`, and `status`. `config_id`, audit owners, order, and icon cannot be supplied by the client. Existing icon values are preserved because NewGen does not yet implement the legacy upload pipeline.
- Added tenant-scoped editing for the 13 `setting_aplikasi` keys written by the current legacy `AnjunganPengaturanController`: title, article categories, ticker text, profile mode/media, screensaver mode/media/time, color, and lighting.
- Added tenant validation for selected article categories and active gallery modes. Both current and disabled tenant categories remain selectable, matching the legacy controller and preserving saved selections.
- Rendered upload/media management and the legacy-only screensaver audio control as unavailable instead of simulating those workflows.

## Security and Scope Review

- Every menu read, aggregate, create, update, delete, and reorder is scoped to `actor.configId`.
- Every setting, category, and gallery read or write is scoped to `actor.configId`.
- Mutation module URLs are exactly `anjungan_menu` and `anjungan_pengaturan`; no broader Anjungan permission is substituted.
- Setting writes update existing tenant rows only. Missing documented storage disables the form and is rejected by the action; no setting rows are invented.
- Form parsing returns only documented menu fields or the exact 13-key setting allowlist.
- External links accept only HTTP/HTTPS; internal menu links reject external schemes. Media values accept HTTP/HTTPS or local `.mp4` paths, and YouTube values normalize to the legacy 11-character ID.
- No generic API route, `CrudManager`, `makeActions`, or `src/lib/actions.ts` dependency was added.
- Unrelated dirty files, including `prisma/schema.prisma` and theme work, were not modified or staged.

## TDD Evidence

- RED: the initial focused suite failed with `MODULE_NOT_FOUND` before `src/lib/anjunganConfig.ts` existed.
- GREEN: the initial 11 menu validation, tenant-order, and setting-allowlist tests passed after the pure validation layer was implemented.
- RED/GREEN: legacy JSON string category IDs were initially dropped, then a failing regression test drove normalization and deduplication.
- RED/GREEN: legacy link type `12` (Statistik Kesehatan) was initially rejected, then a failing parity test drove allowlist and UI support.
- RED/GREEN: a documented relative `.mp4` path was initially rejected, then a failing test drove safe local-path support.
- RED/GREEN: inactive stale gallery selections were initially validated unnecessarily, then a failing test drove validation of active gallery modes only.
- RED/GREEN: the category scope regression test failed before the all-status tenant predicate existed, then passed after removal of the active-only filter.

## Verification

- `npx tsx --test tests/anjunganMenu.test.ts` — **PASS**, 15 passed and 0 failed.
- `npx tsc --noEmit` — **PASS**, exit 0.
- Focused ESLint over all Task 2 TypeScript/TSX files — **PASS**, exit 0.
- `npm test` — **EXPECTED SEQUENCING FAILURE**, 57 passed and 1 failed only because `src/app/(admin)/pengurus/page.tsx` is assigned to Task 3 and is not yet Git-tracked.
- `npm run audit:admin-menu-routes` — **EXPECTED MIGRATION-QUEUE EXIT 1**. Both Anjungan routes are absent from the output; only the eight pages assigned to Tasks 3–4 remain.
- Full-repository ESLint with the default heap exhausted memory. With a 4 GB heap it completed and exposed thousands of pre-existing errors in generated/vendor assets and legacy generic helpers; focused Task 2 lint remains clean.

## Independent Review

- The first review found the legacy type `12`, relative media path, reorder rollback, and disabled-category parity issues.
- Type `12` and relative media support received regression coverage, reorder writes were moved into one interactive transaction, and the category query now keeps all tenant statuses.
- Re-review found no Critical, Important, or Minor issues and returned a **Ready** verdict.

## Remaining Concerns

- The full suite cannot be wholly green until Task 3 creates and tracks `/pengurus`.
- The full route audit intentionally remains nonzero until Tasks 3–4 add their eight assigned pages.
- Icon/media upload remains delegated to the legacy upload/gallery workflows; this task preserves stored references and labels the unavailable controls rather than inventing file behavior.
