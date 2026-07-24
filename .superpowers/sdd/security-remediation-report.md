# Security Remediation Report

## Status

The critical route-dependency finding introduced by commit `6276f5c` is
remediated without adding a fictitious authorization model:

- all 13 newly tracked generic API routes are deleted from the staged Git tree;
- the six pages that depended on `CrudManager` are authenticated admin server
  pages that query Prisma directly and render read-only tables;
- Pengajuan Izin explicitly identifies itself as status-only/read-only and says
  approval and rejection are not available in NewGen;
- Persetujuan Izin remains read-only, with no invented approval workflow;
- Rekapitulasi Kehadiran and Laporan Keuangan remain direct-Prisma read-only
  pages;
- the generic CRUD helpers and unrelated existing routes were not modified.

Full mutation parity and the Kehadiran approval workflow remain deferred until
there is a dedicated authorization, tenant-scoping, and workflow plan.

## Root cause

The 13 new route files exported `GET`, `POST`, `PUT`, and/or `DELETE` directly
from the generic `makeCollection()` and `makeItem()` factories. Those route
handlers had no route-local authentication or resource/tenant authorization.
The six new client pages then exposed those endpoints through the
mutation-capable `CrudManager`.

The committed `src/app/(admin)/layout.tsx` already requires an authenticated
session and redirects unauthenticated users to `/siteman`. Keeping the data
reads inside server components under that layout removes the newly introduced
public HTTP surface while preserving honest read-only access for authenticated
administrators.

## TDD evidence

### RED

The focused regression was written before production changes:

```text
npx tsx --test tests/securityRemediation.test.ts
```

Observed result before deleting the APIs or converting the pages: exit 1.

```text
tests 2
pass 0
fail 2

✖ unsafe target API routes are absent from the Git index
AssertionError: src/app/api/covid19/pantau/route.ts
true !== false

✖ remediated admin pages do not expose CrudManager or API dependencies
AssertionError: src/app/(admin)/covid19/pantau/page.tsx
```

The failures were the intended reproduction: the unsafe routes were tracked,
and the first target page still contained both `CrudManager` and an `/api/`
endpoint.

### GREEN

After deleting and staging the 13 routes and converting all six pages:

```text
npx tsx --test tests/securityRemediation.test.ts
```

Observed result: exit 0.

```text
✔ unsafe target API routes are absent from the Git index
✔ remediated admin pages do not expose CrudManager or API dependencies
tests 2
pass 2
fail 0
```

The first regression snapshots `git ls-files --cached` and checks every removed
route path. The second reads each of the six page sources and rejects both
`CrudManager` and `/api/` references.

## Removed API routes

1. `src/app/api/covid19/pantau/route.ts`
2. `src/app/api/kehadiran/alasan_keluar/route.ts`
3. `src/app/api/kehadiran/alasan_keluar/[id]/route.ts`
4. `src/app/api/kehadiran/hari_libur/route.ts`
5. `src/app/api/kehadiran/hari_libur/[id]/route.ts`
6. `src/app/api/kehadiran/jam_kerja/route.ts`
7. `src/app/api/kehadiran/jam_kerja/[id]/route.ts`
8. `src/app/api/kehadiran/pengaduan/route.ts`
9. `src/app/api/kehadiran/pengaduan/[id]/route.ts`
10. `src/app/api/kehadiran/pengajuan_izin/route.ts`
11. `src/app/api/kehadiran/pengajuan_izin/[id]/route.ts`
12. `src/app/api/laporan_keuangan/route.ts`
13. `src/app/api/laporan_keuangan/[id]/route.ts`

## Read-only page conversion

The following pages are now async server components using `prisma.findMany()`
and the existing `ContentHeader`, `Box`, `LteTable`, `Th`, and `Td`
presentation components:

- `src/app/(admin)/covid19/pantau/page.tsx`
- `src/app/(admin)/kehadiran/alasan_keluar/page.tsx`
- `src/app/(admin)/kehadiran/hari_libur/page.tsx`
- `src/app/(admin)/kehadiran/jam_kerja/page.tsx`
- `src/app/(admin)/kehadiran/pengaduan/page.tsx`
- `src/app/(admin)/kehadiran/pengajuan_izin/page.tsx`

They display at most 100 recent rows, have no create/edit/delete controls, and
have no client endpoint dependencies.

The other three target pages were already server-rendered direct-Prisma pages:

- `src/app/(admin)/kehadiran/persetujuan_izin/page.tsx`
- `src/app/(admin)/kehadiran/rekapitulasi/page.tsx`
- `src/app/(admin)/laporan_keuangan/page.tsx`

No mutation or approval controls were added to them.

## Verification

### Full tests and registry target checks

```text
npm test
```

Exit 0: 10 tests passed, 0 failed. This includes the registry test requiring
every mapped target page to exist and be Git-tracked.

### TypeScript and focused lint

After route deletion, the first compiler invocation correctly identified stale
generated imports in `.next/types/validator.ts`. Regenerating the Next route
types removed those deleted-route imports:

```text
npx next typegen
```

Exit 0: route types generated successfully.

Fresh source verification:

```text
npx tsc --noEmit
npx eslint --quiet \
  'src/app/(admin)/covid19/pantau/page.tsx' \
  'src/app/(admin)/kehadiran/alasan_keluar/page.tsx' \
  'src/app/(admin)/kehadiran/hari_libur/page.tsx' \
  'src/app/(admin)/kehadiran/jam_kerja/page.tsx' \
  'src/app/(admin)/kehadiran/pengaduan/page.tsx' \
  'src/app/(admin)/kehadiran/pengajuan_izin/page.tsx' \
  tests/securityRemediation.test.ts
```

Both exited 0 with no diagnostics.

### Production build

```text
npm run build
```

Exit 0:

```text
✓ Compiled successfully
Finished TypeScript
✓ Generating static pages using 7 workers (143/143)
```

The route manifest contains the nine admin target pages and none of the 13
deleted API paths. The build retains the pre-existing warnings about multiple
lockfiles/workspace-root inference and a broad NFT trace through
`next.config.ts` and generated Prisma.

### Admin route audit

```text
npm run audit:admin-menu-routes
```

The audit exited 1 by design and listed exactly the 13 genuinely missing pages:

1. `/bumindes_umum`
2. `/anjungan_menu`
3. `/buku_kepuasan`
4. `/plugin`
5. `/pengurus/clear`
6. `/anjungan_pengaturan`
7. `/buku_pertanyaan`
8. `/buku_keperluan`
9. `/pendaftaran_kerjasama`
10. `/qrcode`
11. `/plan`
12. `/lapak_admin`
13. `/sinkronisasi`

## Scope integrity and residual concerns

- Only the six required target pages, the 13 route deletions, the focused
  regression test, and this report are included in the remediation commit.
- Unrelated modified and untracked user files remain outside the index.
- Existing generic CRUD APIs elsewhere in the repository were explicitly out
  of scope and were not changed; they should receive a separate authorization
  audit.
- These pages provide authenticated admin-layout reads, not resource-level or
  tenant-level authorization. Mutations must not return until those rules are
  designed and enforced.
- Kehadiran approval/rejection parity is intentionally absent pending a
  dedicated workflow plan.
