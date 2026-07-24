# Remaining Admin Menu Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 13 remaining active-menu fallback pages with tenant-scoped, functional Next.js admin screens.

**Architecture:** Group pages by their real OpenSID domain model. Use dedicated server actions with `requireAdminAccess`, allowlisted `FormData`, and page-level tenant scoping for data that NewGen owns; use read-only, clearly labelled screens for external plugin/registration/synchronization functionality until their external service contract is ported.

**Tech Stack:** Next.js App Router, server actions, Prisma, NextAuth, TypeScript, Node test runner.

## Global Constraints

- No active visible menu URL may resolve to `src/app/(admin)/[...mod]/page.tsx`.
- Do not create generic `/api` CRUD routes or use `CrudManager`, `makeActions`, or `src/lib/actions.ts`.
- Every database read/write must be scoped to the authenticated actor's `config_id`; mutations require the matching OpenSID module access threshold.
- Preserve unrelated user modifications, including theme work in `prisma/schema.prisma`.
- External marketplace, partnership registration, and OpenDK synchronization actions may not be simulated as successful without their real external contract.

---

### Task 1: Close missing route aliases and port Buku Tamu configuration/data

**Files:**
- Modify: `src/lib/adminRouteRegistry.ts`
- Create: `src/app/(admin)/buku_pertanyaan/{actions.ts,BukuPertanyaanManager.tsx,page.tsx}`
- Create: `src/app/(admin)/buku_keperluan/{actions.ts,BukuKeperluanManager.tsx,page.tsx}`
- Create: `src/app/(admin)/buku_kepuasan/page.tsx`
- Modify: `tests/adminRouteRegistry.test.ts`

- [ ] Add `pengurus/clear -> /pengurus` before page creation and extend the literal route fixture.
- [ ] Add failing pure validation tests for nonempty question/need and tenant owner predicates; run them.
- [ ] Implement dedicated tenant-scoped create/update/delete actions for `buku_pertanyaan` and `buku_keperluan` with `b`, `u`, `h` access on their exact module URLs, and functional AdminLTE forms.
- [ ] Render `buku_kepuasan` as a tenant-scoped results/response screen joined to guest and question records; do not permit raw response mutation.
- [ ] Run focused tests, types, lint, and route audit; commit.

### Task 2: Port Anjungan menus and settings

**Files:**
- Create: `src/app/(admin)/anjungan_menu/{actions.ts,AnjunganMenuManager.tsx,page.tsx}`
- Create: `src/app/(admin)/anjungan_pengaturan/{actions.ts,AnjunganPengaturanManager.tsx,page.tsx}`
- Create: `tests/anjunganMenu.test.ts`

- [ ] Add failing validation tests for menu name/link/type/order and safe setting allowlists.
- [ ] Implement tenant-scoped menu CRUD/reordering for `anjungan_menu`, preserving only known fields.
- [ ] Inspect the actual Anjungan setting storage and implement only documented config fields as server actions; render other legacy-only controls as unavailable rather than inventing behavior.
- [ ] Run focused tests, types, lint, and route audit; commit.

### Task 3: Port village administration, map, and market pages

**Files:**
- Create: `src/app/(admin)/pengurus/{actions.ts,PengurusManager.tsx,page.tsx}`
- Create: `src/app/(admin)/bumindes_umum/page.tsx`
- Create: `src/app/(admin)/plan/{actions.ts,PlanManager.tsx,page.tsx}`
- Create: `src/app/(admin)/lapak_admin/page.tsx`
- Create: `tests/adminDomainScope.test.ts`

- [ ] Test pure tenant/ownership validators before implementation.
- [ ] Port core Pengurus fields and status toggles through allowlisted, tenant-scoped actions; retain print/chart extras for a later document/layout task.
- [ ] Render Bumindes administration as a functional entry point to its already-portable subreports.
- [ ] Port location listing and basic coordinates/status management from `lokasi`; do not claim full GIS drawing without its map service.
- [ ] Render Lapak administrator data from existing `produk`/`pelapak` records with tenant scope and clear links to existing product management.
- [ ] Verify and commit.

### Task 4: Port safe integration/configuration screens and complete audit

**Files:**
- Create: `src/app/(admin)/plugin/page.tsx`
- Create: `src/app/(admin)/pendaftaran_kerjasama/page.tsx`
- Create: `src/app/(admin)/qrcode/page.tsx`
- Create: `src/app/(admin)/sinkronisasi/page.tsx`
- Modify: `scripts/audit-admin-menu-routes.ts`

- [ ] Inspect each legacy controller and its real service dependency.
- [ ] Implement QR configuration only where settings are local and known; otherwise provide an explicit configuration form with validation.
- [ ] Render plugin, partnership, and synchronization state from local settings/logs, with external operations disabled and explained until an authenticated service client is implemented.
- [ ] Update audit expectation and run `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm run audit:admin-menu-routes` expecting a zero exit status; commit.

## Self-Review

All 13 current audit entries are assigned to exactly one task. The plan preserves security boundaries by separating local database workflows from external integrations and keeps every route independently testable.
