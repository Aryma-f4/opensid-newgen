# Foundation Dependency Fix Report

## Status

The final-review dependency gap is closed in the staged Git tree. All nine
admin page targets asserted by `tests/adminRouteRegistry.test.ts` are tracked,
and the directly corresponding untracked API routes needed by the integrated
pages are included without staging unrelated workspace changes.

## Root cause

Commit `a966906` mapped aliases to nine page targets that existed only as
user-owned untracked files:

- `covid19/pantau`
- `kehadiran/alasan_keluar`
- `kehadiran/hari_libur`
- `kehadiran/jam_kerja`
- `kehadiran/pengaduan`
- `kehadiran/pengajuan_izin`
- `kehadiran/persetujuan_izin`
- `kehadiran/rekapitulasi`
- `laporan_keuangan`

The registry test used `existsSync()`, so it passed in the shared checkout even
though none of those targets existed in the committed Git tree. A clean archive
therefore did not contain the pages.

## TDD record

### RED

`tests/adminRouteRegistry.test.ts` was first extended to snapshot
`git ls-files --cached` and require every expected alias target to be both
present on disk and tracked in the Git index.

Command:

```text
npm test -- --test-name-pattern='Git-tracked admin page'
```

Observed result before staging any dependency files: exit 1.

```text
tests 8
pass 7
fail 1

AssertionError:
kehadiran/jam_kerja -> /kehadiran/jam_kerja:
src/app/(admin)/kehadiran/jam_kerja/page.tsx is not in the Git index
```

This is the intended failure: the target existed in the working directory but
not in Git.

### GREEN

After staging the minimum page/API dependency closure, the same command exited
0:

```text
tests 8
pass 8
fail 0

maps every expected alias to a Git-tracked admin page
```

The Git lookup was then refactored from one subprocess per alias to one index
snapshot; the focused test remained green.

## Included dependency paths

### Admin pages (9)

- `src/app/(admin)/covid19/pantau/page.tsx`
- `src/app/(admin)/kehadiran/alasan_keluar/page.tsx`
- `src/app/(admin)/kehadiran/hari_libur/page.tsx`
- `src/app/(admin)/kehadiran/jam_kerja/page.tsx`
- `src/app/(admin)/kehadiran/pengaduan/page.tsx`
- `src/app/(admin)/kehadiran/pengajuan_izin/page.tsx`
- `src/app/(admin)/kehadiran/persetujuan_izin/page.tsx`
- `src/app/(admin)/kehadiran/rekapitulasi/page.tsx`
- `src/app/(admin)/laporan_keuangan/page.tsx`

### Direct API routes (13)

- `src/app/api/covid19/pantau/route.ts`
- `src/app/api/kehadiran/alasan_keluar/route.ts`
- `src/app/api/kehadiran/alasan_keluar/[id]/route.ts`
- `src/app/api/kehadiran/hari_libur/route.ts`
- `src/app/api/kehadiran/hari_libur/[id]/route.ts`
- `src/app/api/kehadiran/jam_kerja/route.ts`
- `src/app/api/kehadiran/jam_kerja/[id]/route.ts`
- `src/app/api/kehadiran/pengaduan/route.ts`
- `src/app/api/kehadiran/pengaduan/[id]/route.ts`
- `src/app/api/kehadiran/pengajuan_izin/route.ts`
- `src/app/api/kehadiran/pengajuan_izin/[id]/route.ts`
- `src/app/api/laporan_keuangan/route.ts`
- `src/app/api/laporan_keuangan/[id]/route.ts`

### Regression test

- `tests/adminRouteRegistry.test.ts`

## Rationale for the closure

- Every unique page target referenced by the committed registry now has a
  tracked `page.tsx`.
- The six pages using `CrudManager` are client pages with typed row/field
  definitions, so they do not depend on passing function props across a server
  component boundary.
- The attendance CRUD pages include their collection and item API pairs.
- COVID monitoring includes the collection API path explicitly used by its
  page.
- The directly corresponding financial-report API collection/item pair is
  included with the financial-report page.
- The approval and recap pages read through Prisma on the server and require no
  additional untracked API directories.
- Field names in the attendance approval/recap pages were aligned with the
  committed Prisma schema while removing the new files' explicit `any` casts.
- No aliases were removed or weakened.

## Verification

### Full tests

```text
npm test
```

Exit 0: 8 tests passed, 0 failed.

### TypeScript

```text
npx tsc --noEmit
```

Exit 0 with no diagnostics.

### Changed-file lint

```text
git diff --cached --name-only --diff-filter=ACMR -z | xargs -0 npx eslint --quiet
```

Exit 0 with no diagnostics. The first lint run exposed 33
`@typescript-eslint/no-explicit-any` errors in the untracked page/API sources;
the scoped typing cleanup removed them without touching generic components.

### Production build

```text
npm run build
```

Exit 0:

```text
Compiled successfully
Finished TypeScript
Generating static pages using 7 workers (150/150)
```

The build retained the existing warnings about multiple lockfiles/workspace
root inference and a broad NFT trace through `next.config.ts` and generated
Prisma.

### Clean Git archive

The staged dependency tree was materialized with `git write-tree`, exported
with `git archive`, and extracted under `/tmp`, outside the shared checkout.
All 22 page/API dependency files were then checked in the extracted archive.

```text
tree=728db0c3580051d4e0d5dfea0e8dcc870fbb3a7e
verified=22 dependency files
```

This proves the page/API closure comes from the Git tree rather than untracked
files in the active workspace.

## Scope integrity

Unrelated modified/untracked files were not staged, including:

- `next.config.ts`
- `prisma/schema.prisma`
- theme/preview pages and APIs
- `src/components/admin/CrudManager.tsx`
- `src/components/admin/Toast.tsx`
- existing unrelated admin pages and styles
