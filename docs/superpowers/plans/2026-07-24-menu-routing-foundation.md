# Menu Routing Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every active OpenSID menu resolves through an explicit, testable Next.js route registry, beginning with all aliases whose target pages already exist.

**Architecture:** Extract legacy URL normalization from `adminMenu.ts` into a pure registry module. The sidebar and menu loader consume that module, while a database audit script resolves each active menu URL and verifies its target has a real `page.tsx` under `src/app/(admin)`.

**Tech Stack:** Next.js 16, TypeScript, Prisma 6, Node.js built-in test runner, `tsx` test loader.

## Global Constraints

- Use the OpenSID PHP application in `../app`, `../donjo-app`, and `../Modules` as the source of truth for route meaning and behavior.
- Preserve all pre-existing uncommitted worktree changes; stage only files created or changed by the current task.
- Do not hide an active menu to make the audit pass.
- A route alias may only resolve to a page that exists in `src/app/(admin)`.
- Each production behavior starts with a test that has been observed failing.

---

## File structure

- `src/lib/adminRouteRegistry.ts` — pure legacy-to-Next route registry with no Prisma or React dependency.
- `src/lib/adminMenu.ts` — imports the registry mapper and retains database menu-tree construction only.
- `scripts/audit-admin-menu-routes.ts` — reads active menu records through Prisma and checks each resolved route against the app directory.
- `tests/adminRouteRegistry.test.ts` — regression tests for aliases and fallback normalization.
- `package.json`, `package-lock.json` — test command and `tsx` development dependency.

### Task 1: Establish an executable TypeScript test command

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/adminRouteRegistry.test.ts`

**Interfaces:** Produces `npm test`, which runs `tests/**/*.test.ts` through `tsx` and Node's test runner.

- [ ] **Step 1: Write the failing test**

```ts
// tests/adminRouteRegistry.test.ts
import test from "node:test"
import assert from "node:assert/strict"
import { mapRoute } from "../src/lib/adminRouteRegistry"

test("normalizes the vulnerable-group report clear route", () => {
  assert.equal(mapRoute("laporan_rentan/clear"), "/laporan_rentan")
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx --no-install tsx --test tests/adminRouteRegistry.test.ts`

Expected: the command fails because `tsx` is not installed.

- [ ] **Step 3: Add the test runner without production code**

Run: `npm install --save-dev tsx`

Add to `package.json` scripts:

```json
"test": "tsx --test tests/**/*.test.ts"
```

- [ ] **Step 4: Re-run the single test to verify the intended failure**

Run: `npm test -- tests/adminRouteRegistry.test.ts`

Expected: a module-resolution failure for `src/lib/adminRouteRegistry`, not a loader or TypeScript error.

- [ ] **Step 5: Commit the test harness**

```bash
git add package.json package-lock.json tests/adminRouteRegistry.test.ts
git commit -m "test: add TypeScript route test harness"
```

### Task 2: Create the pure route registry for current aliases

**Files:**
- Create: `src/lib/adminRouteRegistry.ts`
- Modify: `tests/adminRouteRegistry.test.ts`

**Interfaces:** Produces `mapRoute(url: string | null): string | null`. It returns `null` for a null or empty URL, normalizes known legacy aliases, and returns `/${url}` for an unknown non-empty URL so the filesystem audit can report it.

- [ ] **Step 1: Expand the failing test with all active aliases that already have pages**

```ts
const existingPageAliases = {
  "gis/clear": "/gis",
  "laporan_rentan/clear": "/laporan_rentan",
  "vaksin_covid/clear": "/vaksin_covid",
  kehadiran_jam_kerja: "/kehadiran/jam_kerja",
  kehadiran_hari_libur: "/kehadiran/hari_libur",
  kehadiran_rekapitulasi: "/kehadiran/rekapitulasi",
  kehadiran_pengaduan: "/kehadiran/pengaduan",
  kehadiran_pengajuan_izin_pamong: "/kehadiran/pengajuan_izin",
  kehadiran_pengajuan_izin: "/kehadiran/persetujuan_izin",
  kehadiran_keluar: "/kehadiran/alasan_keluar",
  "keuangan/laporan": "/laporan_keuangan",
  "mandiri/clear": "/mandiri",
  "lembaga/clear": "/lembaga",
  "komentar/clear": "/komentar",
  "kelompok/clear": "/kelompok",
  "gallery/clear": "/gallery",
  "program_bantuan/clear": "/program_bantuan",
  data_persil: "/data_persil",
  analisis_master: "/analisis/master",
  "menu/clear": "/menu"
} as const

test("normalizes every active alias whose page already exists", () => {
  for (const [legacyUrl, route] of Object.entries(existingPageAliases)) {
    assert.equal(mapRoute(legacyUrl), route, legacyUrl)
  }
})

test("preserves unknown URLs for filesystem auditing", () => {
  assert.equal(mapRoute("plugin"), "/plugin")
})
```

- [ ] **Step 2: Run the test to verify it fails because the registry does not exist**

Run: `npm test -- tests/adminRouteRegistry.test.ts`

Expected: FAIL with a module-resolution failure for the registry.

- [ ] **Step 3: Write the minimal registry that passes these tests**

```ts
// src/lib/adminRouteRegistry.ts
const LEGACY_ROUTE_MAP: Record<string, string> = {
  "gis/clear": "/gis",
  "laporan_rentan/clear": "/laporan_rentan",
  "vaksin_covid/clear": "/vaksin_covid",
  kehadiran_jam_kerja: "/kehadiran/jam_kerja",
  kehadiran_hari_libur: "/kehadiran/hari_libur",
  kehadiran_rekapitulasi: "/kehadiran/rekapitulasi",
  kehadiran_pengaduan: "/kehadiran/pengaduan",
  kehadiran_pengajuan_izin_pamong: "/kehadiran/pengajuan_izin",
  kehadiran_pengajuan_izin: "/kehadiran/persetujuan_izin",
  kehadiran_keluar: "/kehadiran/alasan_keluar",
  "keuangan/laporan": "/laporan_keuangan",
  "mandiri/clear": "/mandiri",
  "lembaga/clear": "/lembaga",
  "komentar/clear": "/komentar",
  "kelompok/clear": "/kelompok",
  "gallery/clear": "/gallery",
  "program_bantuan/clear": "/program_bantuan",
  data_persil: "/data_persil",
  analisis_master: "/analisis/master",
  "menu/clear": "/menu"
}

export function mapRoute(url: string | null): string | null {
  if (!url) return null
  return LEGACY_ROUTE_MAP[url] ?? `/${url}`
}
```

- [ ] **Step 4: Run the route tests to verify they pass**

Run: `npm test -- tests/adminRouteRegistry.test.ts`

Expected: PASS with all route assertions passing.

- [ ] **Step 5: Commit the registry**

```bash
git add src/lib/adminRouteRegistry.ts tests/adminRouteRegistry.test.ts
git commit -m "feat: normalize active admin menu aliases"
```

### Task 3: Preserve the entire existing route map through the extraction

**Files:**
- Modify: `src/lib/adminMenu.ts`
- Modify: `src/lib/adminRouteRegistry.ts`
- Modify: `tests/adminRouteRegistry.test.ts`

**Interfaces:** `src/lib/adminMenu.ts` re-exports `mapRoute` from the registry. `getAdminMenu(): Promise<Modul[]>` retains its current result shape and database query.

- [ ] **Step 1: Add a test that exercises every legacy mapping already present**

```ts
import { LEGACY_ROUTE_MAP } from "../src/lib/adminRouteRegistry"

test("normalizes every registry entry", () => {
  for (const [legacyUrl, route] of Object.entries(LEGACY_ROUTE_MAP)) {
    assert.equal(mapRoute(legacyUrl), route, legacyUrl)
  }
})
```

- [ ] **Step 2: Run the test to verify it fails because the registry is not exported**

Run: `npm test -- tests/adminRouteRegistry.test.ts`

Expected: FAIL because `LEGACY_ROUTE_MAP` is not exported.

- [ ] **Step 3: Move the complete old `ROUTE_MAP` object into the new module and export it**

In `src/lib/adminRouteRegistry.ts`, make the existing Task 2 object exported:

```ts
export const LEGACY_ROUTE_MAP: Record<string, string> = {
  "menu/clear": "/menu", "man_user/clear": "/man_user", setting_web: "/setting", "setting/aplikasi": "/setting",
  "kehadiran/jam_kerja": "/kehadiran/jam_kerja", "kehadiran/hari_libur": "/kehadiran/hari_libur", "kehadiran/rekapitulasi": "/kehadiran/rekapitulasi", "kehadiran/pengaduan": "/kehadiran/pengaduan", "kehadiran/pengajuan_izin": "/kehadiran/pengajuan_izin", "kehadiran/persetujuan_izin": "/kehadiran/persetujuan_izin", "kehadiran/alasan_keluar": "/kehadiran/alasan_keluar", "kehadiran/index": "/kehadiran", "kehadiran/clear": "/kehadiran",
  analisis_master: "/analisis/master", "analisis_master/index": "/analisis/master", "analisis_master/clear": "/analisis/master", "analisis/master": "/analisis/master", "analisis/master/create": "/analisis/master", "analisis/master/index": "/analisis/master", "analisis/master/clear": "/analisis/master",
  "analisis/kategori": "/analisis/kategori_indikator", analisis_kategori_indikator: "/analisis/kategori_indikator", "analisis_kategori_indikator/index": "/analisis/kategori_indikator", "analisis/kategori_indikator": "/analisis/kategori_indikator",
  analisis_indikator: "/analisis/indikator", "analisis_indikator/index": "/analisis/indikator", "analisis/indikator": "/analisis/indikator", analisis_parameter: "/analisis/parameter", "analisis_parameter/index": "/analisis/parameter", "analisis/parameter": "/analisis/parameter", analisis_klasifikasi: "/analisis/klasifikasi", "analisis_klasifikasi/index": "/analisis/klasifikasi", "analisis/klasifikasi": "/analisis/klasifikasi", analisis_periode: "/analisis/periode", "analisis_periode/index": "/analisis/periode", "analisis/periode": "/analisis/periode", analisis_responden: "/analisis/responden", "analisis_responden/index": "/analisis/responden", "analisis/responden": "/analisis/responden", analisis_laporan: "/analisis/laporan", "analisis_laporan/index": "/analisis/laporan", "analisis/laporan": "/analisis/laporan", analisis_statistik: "/analisis/statistik", "analisis_statistik/index": "/analisis/statistik", "analisis/statistik": "/analisis/statistik", "analisis/index": "/analisis", "analisis/clear": "/analisis",
  "laporan/clear": "/laporan", "laporan/index": "/laporan", "laporan/bulanan": "/laporan", "covid19/pantau": "/covid19/pantau", "covid19/index": "/covid19", "covid19/clear": "/covid19", laporan_keuangan: "/laporan_keuangan", "laporan_keuangan/index": "/laporan_keuangan", kehadiran: "/kehadiran", jam_kerja: "/kehadiran/jam_kerja", hari_libur: "/kehadiran/hari_libur", rekapitulasi: "/kehadiran/rekapitulasi", pengaduan: "/kehadiran/pengaduan", pengajuan_izin: "/kehadiran/pengajuan_izin", persetujuan_izin: "/kehadiran/persetujuan_izin", alasan_keluar: "/kehadiran/alasan_keluar", covid19: "/covid19", covid19_pantau: "/covid19/pantau", pantau: "/covid19/pantau",
  "inventaris_asset/index": "/inventaris_asset", "inventaris_gedung/index": "/inventaris_gedung", "inventaris_jalan/index": "/inventaris_jalan", "inventaris_peralatan/index": "/inventaris_peralatan", "inventaris_tanah/index": "/inventaris_tanah", "bumindes_arsip/index": "/bumindes_arsip", "bumindes_arsip/clear": "/bumindes_arsip",
  "gis/clear": "/gis", "laporan_rentan/clear": "/laporan_rentan", "vaksin_covid/clear": "/vaksin_covid", kehadiran_jam_kerja: "/kehadiran/jam_kerja", kehadiran_hari_libur: "/kehadiran/hari_libur", kehadiran_rekapitulasi: "/kehadiran/rekapitulasi", kehadiran_pengaduan: "/kehadiran/pengaduan", kehadiran_pengajuan_izin_pamong: "/kehadiran/pengajuan_izin", kehadiran_pengajuan_izin: "/kehadiran/persetujuan_izin", kehadiran_keluar: "/kehadiran/alasan_keluar", "keuangan/laporan": "/laporan_keuangan", "mandiri/clear": "/mandiri", "lembaga/clear": "/lembaga", "komentar/clear": "/komentar", "kelompok/clear": "/kelompok", "gallery/clear": "/gallery", "program_bantuan/clear": "/program_bantuan", data_persil: "/data_persil"
}
```

In `src/lib/adminMenu.ts`, delete the local `ROUTE_MAP` declaration and local `mapRoute()` implementation. Add:

```ts
export { mapRoute } from "./adminRouteRegistry"
```

- [ ] **Step 4: Run targeted and static verification**

Run: `npm test -- tests/adminRouteRegistry.test.ts && npx tsc --noEmit && npm run lint -- --quiet`

Expected: all route tests PASS, TypeScript exits 0, and lint reports no errors from changed files.

- [ ] **Step 5: Commit the extraction**

```bash
git add src/lib/adminMenu.ts src/lib/adminRouteRegistry.ts tests/adminRouteRegistry.test.ts
git commit -m "refactor: centralize admin menu routing"
```

### Task 4: Add the active-menu database and filesystem audit

**Files:**
- Create: `scripts/audit-admin-menu-routes.ts`
- Modify: `package.json`

**Interfaces:** Produces `npm run audit:admin-menu-routes`. It prints `All active admin menu URLs resolve.` and exits 0 only when every active non-empty menu URL resolves to a real `page.tsx`; otherwise it prints one `modul (url -> route)` line per unresolved entry and exits 1.

- [ ] **Step 1: Write the failing audit expectation as a shell assertion**

Run: `npm run audit:admin-menu-routes`

Expected: command is absent and exits non-zero.

- [ ] **Step 2: Add the Prisma and filesystem audit script**

```ts
// scripts/audit-admin-menu-routes.ts
import { existsSync } from "node:fs"
import { join } from "node:path"
import { prisma } from "../src/lib/prisma"
import { mapRoute } from "../src/lib/adminRouteRegistry"

async function main() {
  const rows = await prisma.setting_modul.findMany({
    where: { aktif: true, hidden: false, url: { not: "" } },
    select: { modul: true, url: true },
    orderBy: [{ urut: "asc" }]
  })
  const unresolved = rows.flatMap((row) => {
    const route = mapRoute(row.url)
    const relativeRoute = route?.replace(/^\//, "")
    const pagePath = relativeRoute ? join(process.cwd(), "src", "app", "(admin)", relativeRoute, "page.tsx") : ""
    return pagePath && existsSync(pagePath) ? [] : [{ ...row, route }]
  })
  if (unresolved.length === 0) {
    console.log("All active admin menu URLs resolve.")
    return
  }
  for (const row of unresolved) console.error(`${row.modul} (${row.url} -> ${row.route})`)
  process.exitCode = 1
}

main().finally(() => prisma.$disconnect())
```

Add to `package.json` scripts:

```json
"audit:admin-menu-routes": "tsx scripts/audit-admin-menu-routes.ts"
```

- [ ] **Step 3: Run the audit to verify it exposes the remaining migration queue**

Run: `npm run audit:admin-menu-routes`

Expected: exit 1 and list only menu routes whose dedicated page is absent, including `bumindes_umum`, `plugin`, `plan`, and `sinkronisasi`.

- [ ] **Step 4: Commit the audit command**

```bash
git add package.json scripts/audit-admin-menu-routes.ts
git commit -m "test: audit active admin menu routes"
```

### Task 5: Verify the routing foundation

**Files:** Modify: none.

**Interfaces:** Confirms following plans start from a tested registry and explicit unresolved-menu queue.

- [ ] **Step 1: Run focused tests**

Run: `npm test -- tests/adminRouteRegistry.test.ts`

Expected: PASS.

- [ ] **Step 2: Run type checking and linting**

Run: `npx tsc --noEmit && npm run lint -- --quiet`

Expected: both commands exit 0.

- [ ] **Step 3: Run the active-menu audit**

Run: `npm run audit:admin-menu-routes`

Expected: exit 1 only because the next subsystem pages are genuinely absent; retain its output as the migration queue.

- [ ] **Step 4: Run a production build**

Run: `npm run build`

Expected: build exits 0. If it fails on a pre-existing uncommitted file outside this foundation, record the exact error without modifying that file.

- [ ] **Step 5: Confirm commit boundaries**

Run: `git status --short`

Expected: only the user’s pre-existing changes remain unstaged; routing-foundation changes have their own commits.

## Follow-on plans

Create separate plans in this order after Task 5: (1) Buku Tamu and Anjungan data modules, (2) Kehadiran behavior parity, (3) Buku Administrasi and village-administration modules, (4) GIS/Plan and QR utilities, (5) Plugin, Sinkronisasi, OpenDK, and Pelanggan integrations, (6) Lapak and remaining public-service workflows. Each plan uses the audit output, inspects its PHP controller and views first, and reduces the unresolved list without hiding menus.
