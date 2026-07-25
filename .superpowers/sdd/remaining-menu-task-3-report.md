# Remaining Admin Menu Task 3 Report

Date: 2026-07-25

## Delivered

- Added a dedicated `/pengurus` page, manager, and server actions. The page covers core pamong identity, tenant-owned jabatan selection, legacy active/inactive status, attendance participation, and guarded deletion.
- Preserved OpenSID's legacy `pamong_status` values `1` (active) and `2` (inactive). Prisma introspects the legacy column as Boolean, so the dedicated page/action uses parameterized, tenant-qualified SQL only for reading/writing that compatibility field; all other pamong work uses Prisma.
- Added a functional `/bumindes_umum` entry page. The tenant-safe Pengurus destination is active; existing generic subreports discovered to be unscoped are shown as explicitly disabled instead of exposing cross-tenant data.
- Added a dedicated `/plan` page, manager, and server actions for location name, description, tenant-owned point category, coordinates, enabled status, and deletion.
- Added strict coordinate-pair validation. Latitude/longitude must both be empty or both be decimal values within geographic bounds.
- Added a tenant-scoped `/lapak_admin` summary for products and sellers. Product/category/seller/resident joins are assembled only from separately scoped tenant queries, preventing an inconsistent foreign key from exposing another tenant's related row. Links to the existing unscoped `/produk` and `/lapak` pages are withheld with a clear safety label.
- Added pure domain/ownership validation tests and made the Git-index-aware `/pengurus` route-registry check pass.
- Explicitly labels deferred workflows: Pengurus printing/chart/photo/signature layout, interactive GIS drawing/map selection, and full Lapak photo/category/map forms.

## Security and Scope Review

- Page access uses the actual OpenSID module URLs: `pengurus/clear`, `bumindes_umum`, `plan`, and `lapak_admin`.
- Pengurus and Plan pages require `b`; their creates, updates, and status changes require `u`; deletes require `h`.
- Every Pamong, jabatan, lokasi, point, pelapak, produk, produk_kategori, and tweb_penduduk read/write introduced by this task is qualified by `actor.configId`.
- Every submitted record ID is parsed as a positive safe integer and combined with `config_id` for ownership predicates.
- Pamong and location inputs return only explicit field allowlists, reject markup that could become stored XSS in legacy raw-column views, and ignore client-supplied `config_id`, signature flags, PINs, photos, ownership fields, and other legacy columns.
- Active Kepala Desa/Sekretaris Desa uniqueness is checked by legacy numeric `jenis` and `pamong_status` values while holding tenant role rows in a transaction.
- Resident-backed Pamong identity joins residents by both ID and tenant. Linked name/NIK fields are read-only in this manager and are not overwritten by Pamong updates.
- Pamong deletion is refused while user, letter, disposition, leave, complaint, attendance, or legacy-managed photo data exists; the lock/check/delete sequence is atomic.
- Location category IDs must resolve to a child point (`tipe = 2`) owned by the actor's tenant or to a shared `config_id IS NULL` OpenSID reference point.
- Location deletion uses the same tenant row-lock/check/delete pattern and refuses to orphan a legacy-managed photo.
- Raw Pamong status SQL is parameterized and includes both `pamong_id` and `config_id`.
- No generic API route, `CrudManager`, `makeActions`, or `src/lib/actions.ts` dependency was added.
- Unrelated dirty work, including `prisma/schema.prisma` and theme changes, was not modified or staged.

## TDD Evidence

- RED: the focused domain suite initially failed with `MODULE_NOT_FOUND` before `src/lib/adminDomainScope.ts` existed.
- GREEN: seven pure tests passed after adding allowlisted Pamong/location parsers, coordinate validation, tenant predicates, positive IDs, and the guarded-deletion rule.
- RED: the status-only mutation test failed because its parsers did not yet exist.
- GREEN: the suite passed after adding strict legacy `1/2` Pamong and binary `0/1` status parsers.
- Registry RED: the baseline suite reported `/pengurus/page.tsx` missing.
- Registry intermediate RED: after creation, the registry correctly reported that the page was not yet in the Git index.
- Registry GREEN: after staging only the Task 3 route file, the focused route/domain suite passed 15/15.
- Review-driven RED/GREEN: six initial failures drove markup rejection, required location descriptions, shared-point ownership, managed-file deletion guards, special-role activation semantics, and resident identity precedence.

## Verification

- `npx tsx --test tests/adminDomainScope.test.ts tests/adminRouteRegistry.test.ts` — **PASS**, 18 passed and 0 failed.
- `npm test` — **PASS**, 69 passed and 0 failed.
- `npx tsc --noEmit` — **PASS**, exit 0.
- Focused ESLint over all Task 3 TypeScript/TSX files — **PASS**, exit 0.
- `git diff --check` and `git diff --cached --check` — **PASS**, exit 0.
- `npm run audit:admin-menu-routes` — **EXPECTED MIGRATION-QUEUE EXIT 1**. No Task 3 route remains; output contains only the four Task 4 routes: `plugin`, `pendaftaran_kerjasama`, `qrcode`, and `sinkronisasi`.
- Full-repository `npm run lint` exhausted Node's default heap. A 4 GB rerun completed with 9,383 pre-existing findings concentrated in generated Prisma output, public theme/vendor bundles, and legacy libraries; focused Task 3 lint remains clean.

## Independent Review

- The first review found stored-markup risk, unsafe links to unscoped pages, special-role uniqueness, resident identity, shared reference-point parity, required description parity, and legacy file lifecycle gaps.
- The implementation rejected markup, disabled unsafe destinations, serialized special-role activation, added a tenant-safe resident join, allowed shared-null points, required descriptions, and deferred deletion for managed files.
- Re-review cleared those findings and identified two delete time-of-check/time-of-use windows plus two form-honesty details.
- Both delete flows now lock, check, and delete atomically; resident-backed identity is visibly read-only; and the description field is client-required.
- Final re-review found no Critical, Important, or Minor issues and returned a **Ready** verdict.

## Remaining Concerns

- Full interactive GIS drawing, marker selection, symbols, and location-photo handling need the future map service; this page intentionally manages validated coordinates without claiming those capabilities.
- Pengurus print/export, organizational chart layout, photos, and a.n/u.b. signature workflows remain for the later document/layout port.
- Lapak product/category/photo/map mutation remains deferred. Existing `/produk` and `/lapak` pages are intentionally not linked because they are not yet tenant-safe.
- Existing generic Bumindes subreports remain disabled in the new hub until their hard-coded/unscoped storage paths are remediated.
- The repository-wide lint baseline is not green because generated/vendor assets and legacy helpers are currently included by the root ESLint command.
- The route audit intentionally remains nonzero until Task 4 ports the four external integration/configuration routes.
