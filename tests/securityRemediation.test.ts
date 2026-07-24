import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const REMOVED_API_ROUTES = [
  "src/app/api/covid19/pantau/route.ts",
  "src/app/api/kehadiran/alasan_keluar/route.ts",
  "src/app/api/kehadiran/alasan_keluar/[id]/route.ts",
  "src/app/api/kehadiran/hari_libur/route.ts",
  "src/app/api/kehadiran/hari_libur/[id]/route.ts",
  "src/app/api/kehadiran/jam_kerja/route.ts",
  "src/app/api/kehadiran/jam_kerja/[id]/route.ts",
  "src/app/api/kehadiran/pengaduan/route.ts",
  "src/app/api/kehadiran/pengaduan/[id]/route.ts",
  "src/app/api/kehadiran/pengajuan_izin/route.ts",
  "src/app/api/kehadiran/pengajuan_izin/[id]/route.ts",
  "src/app/api/laporan_keuangan/route.ts",
  "src/app/api/laporan_keuangan/[id]/route.ts",
] as const

const READ_ONLY_ADMIN_PAGES = [
  "src/app/(admin)/covid19/pantau/page.tsx",
  "src/app/(admin)/kehadiran/alasan_keluar/page.tsx",
  "src/app/(admin)/kehadiran/hari_libur/page.tsx",
  "src/app/(admin)/kehadiran/jam_kerja/page.tsx",
  "src/app/(admin)/kehadiran/pengaduan/page.tsx",
  "src/app/(admin)/kehadiran/pengajuan_izin/page.tsx",
] as const

test("unsafe target API routes are absent from the Git index", () => {
  const trackedFiles = new Set(
    execFileSync("git", ["ls-files", "--cached"], {
      cwd: process.cwd(),
      encoding: "utf8",
    })
      .trim()
      .split("\n"),
  )

  for (const routePath of REMOVED_API_ROUTES) {
    assert.equal(trackedFiles.has(routePath), false, routePath)
  }
})

test("remediated admin pages do not expose CrudManager or API dependencies", () => {
  for (const pagePath of READ_ONLY_ADMIN_PAGES) {
    const source = readFileSync(join(process.cwd(), pagePath), "utf8")

    assert.doesNotMatch(source, /\bCrudManager\b/, pagePath)
    assert.doesNotMatch(source, /\/api\//, pagePath)
  }
})
