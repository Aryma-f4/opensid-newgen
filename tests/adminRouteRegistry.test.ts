import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { LEGACY_ROUTE_MAP, mapRoute } from "../src/lib/adminRouteRegistry"

const EXPECTED_LEGACY_ROUTE_MAP = {
  "menu/clear": "/menu",
  "man_user/clear": "/man_user",
  setting_web: "/setting",
  "setting/aplikasi": "/setting",
  "kehadiran/jam_kerja": "/kehadiran/jam_kerja",
  "kehadiran/hari_libur": "/kehadiran/hari_libur",
  "kehadiran/rekapitulasi": "/kehadiran/rekapitulasi",
  "kehadiran/pengaduan": "/kehadiran/pengaduan",
  "kehadiran/pengajuan_izin": "/kehadiran/pengajuan_izin",
  "kehadiran/persetujuan_izin": "/kehadiran/persetujuan_izin",
  "kehadiran/alasan_keluar": "/kehadiran/alasan_keluar",
  "kehadiran/index": "/kehadiran",
  "kehadiran/clear": "/kehadiran",
  analisis_master: "/analisis/master",
  "analisis_master/index": "/analisis/master",
  "analisis_master/clear": "/analisis/master",
  "analisis/master": "/analisis/master",
  "analisis/master/create": "/analisis/master",
  "analisis/master/index": "/analisis/master",
  "analisis/master/clear": "/analisis/master",
  "analisis/kategori": "/analisis/kategori_indikator",
  analisis_kategori_indikator: "/analisis/kategori_indikator",
  "analisis_kategori_indikator/index": "/analisis/kategori_indikator",
  "analisis/kategori_indikator": "/analisis/kategori_indikator",
  analisis_indikator: "/analisis/indikator",
  "analisis_indikator/index": "/analisis/indikator",
  "analisis/indikator": "/analisis/indikator",
  analisis_parameter: "/analisis/parameter",
  "analisis_parameter/index": "/analisis/parameter",
  "analisis/parameter": "/analisis/parameter",
  analisis_klasifikasi: "/analisis/klasifikasi",
  "analisis_klasifikasi/index": "/analisis/klasifikasi",
  "analisis/klasifikasi": "/analisis/klasifikasi",
  analisis_periode: "/analisis/periode",
  "analisis_periode/index": "/analisis/periode",
  "analisis/periode": "/analisis/periode",
  analisis_responden: "/analisis/responden",
  "analisis_responden/index": "/analisis/responden",
  "analisis/responden": "/analisis/responden",
  analisis_laporan: "/analisis/laporan",
  "analisis_laporan/index": "/analisis/laporan",
  "analisis/laporan": "/analisis/laporan",
  analisis_statistik: "/analisis/statistik",
  "analisis_statistik/index": "/analisis/statistik",
  "analisis/statistik": "/analisis/statistik",
  "analisis/index": "/analisis",
  "analisis/clear": "/analisis",
  "laporan/clear": "/laporan",
  "laporan/index": "/laporan",
  "laporan/bulanan": "/laporan",
  "covid19/pantau": "/covid19/pantau",
  "covid19/index": "/covid19",
  "covid19/clear": "/covid19",
  laporan_keuangan: "/laporan_keuangan",
  "laporan_keuangan/index": "/laporan_keuangan",
  kehadiran: "/kehadiran",
  jam_kerja: "/kehadiran/jam_kerja",
  hari_libur: "/kehadiran/hari_libur",
  rekapitulasi: "/kehadiran/rekapitulasi",
  pengaduan: "/kehadiran/pengaduan",
  pengajuan_izin: "/kehadiran/pengajuan_izin",
  persetujuan_izin: "/kehadiran/persetujuan_izin",
  alasan_keluar: "/kehadiran/alasan_keluar",
  covid19: "/covid19",
  covid19_pantau: "/covid19/pantau",
  pantau: "/covid19/pantau",
  "inventaris_asset/index": "/inventaris_asset",
  "inventaris_gedung/index": "/inventaris_gedung",
  "inventaris_jalan/index": "/inventaris_jalan",
  "inventaris_peralatan/index": "/inventaris_peralatan",
  "inventaris_tanah/index": "/inventaris_tanah",
  "bumindes_arsip/index": "/bumindes_arsip",
  "bumindes_arsip/clear": "/bumindes_arsip",
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
  "opendk_pesan/clear": "/opendk_pesan",
  data_persil: "/data_persil",
} as const

test("normalizes the OpenDK message clear route to its index page", () => {
  assert.equal(mapRoute("opendk_pesan/clear"), "/opendk_pesan")
})

test("matches the complete expected legacy route map", () => {
  assert.deepEqual(LEGACY_ROUTE_MAP, EXPECTED_LEGACY_ROUTE_MAP)
})

test("maps every expected alias to an existing admin page", () => {
  for (const [legacyUrl, route] of Object.entries(EXPECTED_LEGACY_ROUTE_MAP)) {
    assert.equal(mapRoute(legacyUrl), route, legacyUrl)

    const pagePath = join(
      process.cwd(),
      "src",
      "app",
      "(admin)",
      route.slice(1),
      "page.tsx",
    )
    assert.equal(existsSync(pagePath), true, `${legacyUrl} -> ${route}: ${pagePath}`)
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
