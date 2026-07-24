# Task 4 Report: Active Admin Menu Route Audit

## Status

Implemented and committed the active-menu database/filesystem audit.

## Changes

- Added `scripts/audit-admin-menu-routes.ts` exactly as specified. It queries active, visible, non-empty `setting_modul` URLs in display order, maps each URL through `mapRoute`, and verifies its dedicated admin `page.tsx` file exists.
- Added `npm run audit:admin-menu-routes` to `package.json`.
- The command prints `All active admin menu URLs resolve.` and exits 0 when no unresolved routes remain; otherwise it emits one `modul (url -> route)` line per unresolved route and exits 1.

## Verification

1. RED check before implementation: `npm run audit:admin-menu-routes` exited 1 because the script was absent (`Missing script: "audit:admin-menu-routes"`).
2. Post-implementation check: `npm run audit:admin-menu-routes` exited 1 as designed and listed only unresolved active menu pages. The queue included `bumindes_umum`, `plugin`, `plan`, and `sinkronisasi`.
3. Self-review: `git diff --cached --check` passed before commit, and `git show --check HEAD` completed without whitespace errors.

## Commit

`a21baf9 test: audit active admin menu routes`

## Scope and concerns

- Only `package.json` and `scripts/audit-admin-menu-routes.ts` were staged and committed. No lockfile was modified.
- The final audit command exits 1 intentionally until the listed menu routes receive dedicated pages; this is the required migration queue / RED state, not a defect.
- Existing unrelated modified and untracked workspace files were left untouched.

---

## Visibility-rule correction

### Root cause

The audit previously used Prisma's Boolean `setting_modul.hidden` field with `hidden: false`. Upstream OpenSID defines `SHOW = 0`, `SHOW_S = 1`, and `HIDDEN = 2`; its `scopeIsShow()` includes `hidden IN (0, 1)`. The Boolean schema therefore excluded the valid `SHOW_S = 1` rows and could produce a false-green audit.

### TDD record

1. RED: added `tests/adminMenuVisibility.test.ts`, importing the intentionally absent `src/lib/adminMenuVisibility.ts` and asserting `0` and `1` are visible while `2` is not. `npm test -- tests/adminMenuVisibility.test.ts` failed as expected with `Cannot find module '../src/lib/adminMenuVisibility'`.
2. GREEN: added `src/lib/adminMenuVisibility.ts` with `isVisibleMenu(hidden: number): boolean`, returning true only for `0` or `1`.
3. Updated `scripts/audit-admin-menu-routes.ts` to use a static tagged `prisma.$queryRaw` query selecting `modul`, `url`, and raw numeric `hidden` from active, non-empty `setting_modul` rows ordered by `urut`, then filters with `isVisibleMenu(Number(row.hidden))` before resolving pages. The Boolean Prisma `hidden` field is no longer used for this decision.

### Verification

- `npx tsx --test tests/adminMenuVisibility.test.ts`: passed, 1/1 tests.
- `npx tsx --test tests/adminRouteRegistry.test.ts`: passed, 5/5 tests.
- `npm run audit:admin-menu-routes`: exited 1 as required and reported only pages absent from the filesystem: `bumindes_umum`, `anjungan_menu`, `buku_kepuasan`, `plugin`, `pengurus/clear`, `anjungan_pengaturan`, `buku_pertanyaan`, `buku_keperluan`, `pendaftaran_kerjasama`, `qrcode`, `plan`, `lapak_admin`, `opendk_pesan/clear`, and `sinkronisasi`.

### Scope and concern

Only the visibility helper, its focused test, the audit script, and this report are part of this correction. The audit intentionally remains non-zero until every listed menu route has a dedicated page.
