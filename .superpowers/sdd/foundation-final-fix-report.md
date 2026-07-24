# Foundation Final Fix Report

## Status

All three final-review findings are implemented and verified:

1. `getAdminMenu()` now reads the raw numeric `hidden` column for active rows, and a pure helper filters `SHOW=0` and `SHOW_S=1` through the existing `isVisibleMenu(Number(row.hidden))` rule while excluding `HIDDEN=2`.
2. `opendk_pesan/clear` now maps to `/opendk_pesan`.
3. Route-registry tests now use an independent, test-owned fixture containing all 92 mappings, compare the complete key/value object exactly, and verify every mapped target has an admin `page.tsx`.

## Root-cause evidence

- `/Users/dsi/projects/OpenSID/app/Models/Modul.php` defines `SHOW=0`, `SHOW_S=1`, and `HIDDEN=2`; `scopeIsShow()` includes both `0` and `1`.
- Prisma models `setting_modul.hidden` as `Boolean`, so `findMany({ hidden: false })` cannot express the upstream three-state visibility rule and excludes valid `SHOW_S=1` rows.
- `/Users/dsi/projects/OpenSID/donjo-app/controllers/Opendk_pesan.php` implements `clear()` by redirecting to the controller index when no return value is supplied.
- `src/app/(admin)/opendk_pesan/page.tsx` exists.

## Changes

### `src/lib/adminMenu.ts`

- Replaced the Boolean Prisma `findMany` filter with a static tagged `$queryRaw` query.
- The query selects raw `hidden` values from active rows and retains `ORDER BY urut ASC`.
- Delegates deterministic visibility filtering and tree construction to `buildAdminMenu()`.
- Continues to export the existing `Modul` type and `mapRoute` interface.

### `src/lib/adminMenuTree.ts`

- Added a pure `buildAdminMenu(rows)` helper with no Prisma/database dependency.
- Calls the already-tested `isVisibleMenu(Number(row.hidden))`.
- Preserves input order, parent/child shape, null-parent normalization, and the existing public menu object shape.

### `src/lib/adminRouteRegistry.ts`

- Added `"opendk_pesan/clear": "/opendk_pesan"`.

### `tests/adminMenuTree.test.ts`

- Added a database-free regression containing both root and child `SHOW_S=1` rows.
- Proves `HIDDEN=2` root and child rows are excluded.
- Proves ordering and hierarchy are preserved.

### `tests/adminRouteRegistry.test.ts`

- Removed the subset fixture and self-referential `Object.entries(LEGACY_ROUTE_MAP)` expectation.
- Added a literal test-owned fixture for all 92 mappings.
- Added exact deep key/value equality against the registry.
- Added `mapRoute()` assertions and filesystem checks for every mapping target.
- Added the focused OpenDK regression assertion.

## TDD record

### 1. Numeric menu visibility and tree construction

RED command:

```text
npm test -- tests/adminMenuTree.test.ts
```

Observed RED output (exit 1):

```text
Error: Cannot find module '../src/lib/adminMenuTree'
Require stack:
- /Users/dsi/projects/OpenSID/opensid-newgen/tests/adminMenuTree.test.ts
...
tests 7
pass 6
fail 1
```

This was the expected failure because the pure helper did not exist.

GREEN command after adding the helper and raw numeric query:

```text
npm test -- tests/adminMenuTree.test.ts
```

Observed GREEN output (exit 0):

```text
✔ builds an ordered tree from SHOW and SHOW_S rows while excluding HIDDEN rows
✔ menu visibility includes SHOW and SHOW_S but excludes HIDDEN
✔ normalizes every active alias whose page already exists
✔ normalizes every registry entry
✔ preserves unknown URLs for filesystem auditing
✔ returns null for a null URL
✔ returns null for an empty URL
tests 7
pass 7
fail 0
```

### 2. OpenDK clear alias

RED command:

```text
npm test -- tests/adminRouteRegistry.test.ts
```

Observed RED output (exit 1):

```text
✖ normalizes the OpenDK message clear route to its index page
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ '/opendk_pesan/clear'
- '/opendk_pesan'
tests 8
pass 7
fail 1
```

GREEN command after adding the alias:

```text
npm test -- tests/adminRouteRegistry.test.ts
```

Observed GREEN output (exit 0):

```text
✔ normalizes the OpenDK message clear route to its index page
tests 8
pass 8
fail 0
```

### 3. Independent exhaustive registry fixture

Before restoring the OpenDK implementation, the new literal 92-entry fixture was run with that alias deliberately absent. This validates that the test itself, rather than `LEGACY_ROUTE_MAP`, owns the expected mapping.

RED command:

```text
npm test -- tests/adminRouteRegistry.test.ts
```

Observed RED output (exit 1):

```text
✖ normalizes the OpenDK message clear route to its index page
✖ matches the complete expected legacy route map
✖ maps every expected alias to an existing admin page
...
-   'opendk_pesan/clear': '/opendk_pesan',
...
tests 8
pass 5
fail 3
```

GREEN command after restoring the required mapping:

```text
npm test -- tests/adminRouteRegistry.test.ts
```

Observed GREEN output (exit 0):

```text
✔ normalizes the OpenDK message clear route to its index page
✔ matches the complete expected legacy route map
✔ maps every expected alias to an existing admin page
tests 8
pass 8
fail 0
```

### 4. Missing target-page mutation proof

To prove the filesystem assertion is effective, both registry and fixture were temporarily pointed at `/missing_admin_page`; this keeps exact registry/fixture equality green while making the target page absent. Both files were restored immediately afterward.

RED mutation command:

```text
npm test -- tests/adminRouteRegistry.test.ts
```

Observed RED output (exit 1):

```text
✖ normalizes the OpenDK message clear route to its index page
✔ matches the complete expected legacy route map
✖ maps every expected alias to an existing admin page
AssertionError [ERR_ASSERTION]: opendk_pesan/clear -> /missing_admin_page: /Users/dsi/projects/OpenSID/opensid-newgen/src/app/(admin)/missing_admin_page/page.tsx
false !== true
tests 8
pass 6
fail 2
```

Final GREEN after restoring `/opendk_pesan` is included in the final verification below.

## Final verification

Final-state command:

```text
npm test && npx tsc --noEmit && npx eslint --quiet src/lib/adminMenu.ts src/lib/adminMenuTree.ts src/lib/adminRouteRegistry.ts tests/adminMenuTree.test.ts tests/adminRouteRegistry.test.ts && npm run build
```

Observed result: exit 0.

```text
tests 8
pass 8
fail 0
cancelled 0
skipped 0
todo 0

TypeScript: exit 0, no diagnostics.
Changed-file ESLint: exit 0, no diagnostics.
Next.js production build:
✓ Compiled successfully
✓ Generating static pages using 7 workers (150/150)
exit 0
```

The build retained two existing warnings: multiple lockfiles/workspace-root inference and a broad NFT trace originating through `next.config.ts`/generated Prisma.

### Repository-wide lint

The plan's repository-wide lint command was also attempted.

First attempt:

```text
npm run lint -- --quiet
```

Observed result: exit 134 after the test suite and TypeScript passed.

```text
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

Second attempt with a larger Node heap:

```text
node --max-old-space-size=4096 ./node_modules/eslint/bin/eslint.js --quiet .
```

Observed result: exit 1 with pre-existing repository errors outside this patch.

```text
✖ 4725 problems (4725 errors, 0 warnings)
```

The errors are dominated by vendored assets under `public/themes`, generated Prisma runtime files, and legacy application files. The separate changed-file lint listed above exits 0.

### Active-menu audit

Command:

```text
npm run audit:admin-menu-routes
```

Observed result: expected exit 1 for the remaining migration queue:

```text
Administrasi Umum (bumindes_umum -> /bumindes_umum)
Menu (anjungan_menu -> /anjungan_menu)
Data Kepuasan (buku_kepuasan -> /buku_kepuasan)
Paket Tambahan (plugin -> /plugin)
[Pemerintah Desa] (pengurus/clear -> /pengurus/clear)
Pengaturan (anjungan_pengaturan -> /anjungan_pengaturan)
Data Pertanyaan (buku_pertanyaan -> /buku_pertanyaan)
Data Keperluan (buku_keperluan -> /buku_keperluan)
Pendaftaran Kerjasama (pendaftaran_kerjasama -> /pendaftaran_kerjasama)
QR Code (qrcode -> /qrcode)
Pengaturan Peta (plan -> /plan)
Lapak (lapak_admin -> /lapak_admin)
Sinkronisasi (sinkronisasi -> /sinkronisasi)
```

`opendk_pesan/clear` is no longer unresolved.

### Diff integrity

```text
git diff --check
```

Observed result: exit 0.

## Self-review

- The SQL is a static tagged Prisma raw query; no interpolated input is present.
- Active filtering remains in SQL (`aktif = 1`), while visibility is evaluated from the raw numeric database value through the single existing `isVisibleMenu` rule.
- The query retains ascending `urut` order, and `buildAdminMenu()` inserts rows into parent buckets in that order.
- The helper returns the same `Modul` fields and nested `children` structure used by `Sidebar`.
- Null parents still normalize to root `0`, matching the prior implementation.
- The menu-tree regression imports only the pure helper and does not initialize Prisma or require a live database.
- The expected route fixture is independent of production registry construction. Exact deep equality detects deleted, extra, or remapped aliases.
- The page check uses each expected route and the concrete `src/app/(admin)/<route>/page.tsx` path; no live database is needed.
- No unrelated modified or untracked file was edited or staged.

## Scope and concerns

- Required commit files are limited to:
  - `src/lib/adminMenu.ts`
  - `src/lib/adminMenuTree.ts`
  - `src/lib/adminRouteRegistry.ts`
  - `tests/adminMenuTree.test.ts`
  - `tests/adminRouteRegistry.test.ts`
  - `.superpowers/sdd/foundation-final-fix-report.md`
- Repository-wide lint remains red because of 4,725 pre-existing errors; all changed files lint clean.
- Nine registry targets currently resolve to user-owned untracked pages (`covid19/pantau`, seven `kehadiran/*` pages, and `laporan_keuangan`). They are intentionally not staged by this focused fix. The exhaustive filesystem test passes in the shared working tree but requires those pages to be included by their owning work before a clean checkout can pass.
- The audit intentionally remains non-zero until the 13 listed subsystem pages are implemented.
