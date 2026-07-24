import test from "node:test"
import assert from "node:assert/strict"
import { LEGACY_ROUTE_MAP, mapRoute } from "../src/lib/adminRouteRegistry"

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

test("normalizes every registry entry", () => {
  for (const [legacyUrl, route] of Object.entries(LEGACY_ROUTE_MAP)) {
    assert.equal(mapRoute(legacyUrl), route, legacyUrl)
  }
})

test("preserves unknown URLs for filesystem auditing", () => {
  assert.equal(mapRoute("plugin"), "/plugin")
})

test("returns null for a null URL", () => {
  assert.equal(mapRoute(null), null)
})

test("returns null for an empty URL", () => {
  assert.equal(mapRoute(""), null)
})
