import assert from "node:assert/strict"
import test from "node:test"

import {
  activeAnjunganGalleryIds,
  anjunganCategoryWhere,
  ANJUNGAN_SETTING_KEYS,
  menuOrderMatchesTenant,
  parseAnjunganMenuId,
  parseAnjunganMenuInput,
  parseAnjunganMenuOrder,
  parseAnjunganSettings,
  parseStoredAnjunganArticleIds,
  tenantAnjunganMenuWhere,
} from "../src/lib/anjunganConfig"

function form(values: Record<string, string | string[]>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) formData.append(key, item)
    } else {
      formData.set(key, value)
    }
  }
  return formData
}

function validSettings(overrides: Record<string, string | string[]> = {}): FormData {
  return form({
    sebutan_anjungan_mandiri: "Anjungan Desa Mandiri",
    anjungan_artikel: ["4", "9"],
    anjungan_teks_berjalan: "Selamat datang",
    anjungan_profil: "3",
    anjungan_slide: "",
    anjungan_video: "",
    anjungan_youtube: "PuxiuH-YUF4",
    tampilan_anjungan: "1",
    tampilan_anjungan_waktu: "30",
    tampilan_anjungan_slider: "12",
    tampilan_anjungan_video: "",
    warna_anjungan: "nature",
    pencahayaan_anjungan: "light",
    ...overrides,
  })
}

test("menu input trims and allowlists the supported editable fields", () => {
  const input = form({
    nama: "  Statistik Penduduk  ",
    link: "  statistik/0  ",
    link_tipe: "2",
    status: "1",
    config_id: "999",
    urut: "99",
    created_by: "999",
    icon: "../../secret",
  })

  assert.deepEqual(parseAnjunganMenuInput(input), {
    nama: "Statistik Penduduk",
    link: "statistik/0",
    link_tipe: 2,
    status: 1,
  })
})

test("menu input rejects a blank or overlong name", () => {
  assert.throws(
    () => parseAnjunganMenuInput(form({ nama: " ", link: "profil", link_tipe: "5", status: "1" })),
    /Nama menu wajib diisi/,
  )
  assert.throws(
    () => parseAnjunganMenuInput(form({ nama: "x".repeat(51), link: "profil", link_tipe: "5", status: "1" })),
    /maksimal 50 karakter/,
  )
})

test("menu input rejects blank and unsafe links", () => {
  assert.throws(
    () => parseAnjunganMenuInput(form({ nama: "Profil", link: " ", link_tipe: "5", status: "1" })),
    /Link menu wajib diisi/,
  )
  assert.throws(
    () => parseAnjunganMenuInput(form({ nama: "Profil", link: "javascript:alert(1)", link_tipe: "99", status: "1" })),
    /Link eksternal harus berupa URL HTTP atau HTTPS/,
  )
})

test("menu input accepts only documented link types and binary status", () => {
  assert.equal(
    parseAnjunganMenuInput(form({
      nama: "Kesehatan",
      link: "statistik/kesehatan",
      link_tipe: "12",
      status: "1",
    })).link_tipe,
    12,
  )
  assert.throws(
    () => parseAnjunganMenuInput(form({ nama: "Profil", link: "profil", link_tipe: "13", status: "1" })),
    /Jenis link tidak valid/,
  )
  assert.throws(
    () => parseAnjunganMenuInput(form({ nama: "Profil", link: "profil", link_tipe: "5", status: "2" })),
    /Status menu tidak valid/,
  )
})

test("menu order accepts unique positive IDs and rejects malformed order", () => {
  assert.deepEqual(parseAnjunganMenuOrder(form({ order: "[8,3,5]" })), [8, 3, 5])
  assert.throws(() => parseAnjunganMenuOrder(form({ order: "[8,8]" })), /Urutan menu tidak valid/)
  assert.throws(() => parseAnjunganMenuOrder(form({ order: "[0,2]" })), /Urutan menu tidak valid/)
  assert.throws(() => parseAnjunganMenuOrder(form({ order: "not-json" })), /Urutan menu tidak valid/)
})

test("menu reordering must contain exactly the current tenant menu IDs", () => {
  assert.equal(menuOrderMatchesTenant([8, 3, 5], [3, 5, 8]), true)
  assert.equal(menuOrderMatchesTenant([8, 3], [3, 5, 8]), false)
  assert.equal(menuOrderMatchesTenant([8, 3, 99], [3, 5, 8]), false)
})

test("menu record predicates bind IDs to the authenticated tenant", () => {
  assert.equal(parseAnjunganMenuId(form({ id: "42" })), 42)
  assert.deepEqual(tenantAnjunganMenuWhere(42, 7), { id: 42, config_id: 7 })
  assert.throws(() => parseAnjunganMenuId(form({ id: "1.5" })), /Menu tidak valid/)
  assert.throws(() => tenantAnjunganMenuWhere(42, 0), /Tenant tidak valid/)
})

test("category options retain all statuses while remaining tenant scoped", () => {
  assert.deepEqual(anjunganCategoryWhere(7), { config_id: 7 })
  assert.throws(() => anjunganCategoryWhere(0), /Tenant tidak valid/)
})

test("settings parser emits only the documented setting allowlist", () => {
  const input = validSettings({
    config_id: "999",
    kategori: "sistem",
    unexpected_setting: "enabled",
  })
  const parsed = parseAnjunganSettings(input)

  assert.deepEqual(Object.keys(parsed).sort(), [...ANJUNGAN_SETTING_KEYS].sort())
  assert.equal(parsed.sebutan_anjungan_mandiri, "Anjungan Desa Mandiri")
  assert.equal(parsed.anjungan_artikel, "[4,9]")
  assert.equal("unexpected_setting" in parsed, false)
  assert.equal("config_id" in parsed, false)
})

test("stored legacy article settings accept JSON string IDs without duplicating them", () => {
  assert.deepEqual(parseStoredAnjunganArticleIds('["4","9","4"]'), [4, 9])
  assert.deepEqual(parseStoredAnjunganArticleIds("[4,9]"), [4, 9])
  assert.deepEqual(parseStoredAnjunganArticleIds("null"), [])
  assert.deepEqual(parseStoredAnjunganArticleIds("not-json"), [])
})

test("settings parser validates category IDs and documented enum values", () => {
  assert.throws(
    () => parseAnjunganSettings(validSettings({ anjungan_artikel: ["4", "0"] })),
    /Kategori artikel tidak valid/,
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({ anjungan_profil: "4" })),
    /Tampilan profil tidak valid/,
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({ tampilan_anjungan: "3" })),
    /Screensaver tidak valid/,
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({ warna_anjungan: "neon" })),
    /Warna anjungan tidak valid/,
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({ pencahayaan_anjungan: "auto" })),
    /Pencahayaan anjungan tidak valid/,
  )
})

test("settings parser normalizes a YouTube URL and rejects an invalid ID", () => {
  assert.equal(
    parseAnjunganSettings(validSettings({
      anjungan_youtube: "https://www.youtube.com/watch?v=PuxiuH-YUF4",
    })).anjungan_youtube,
    "PuxiuH-YUF4",
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({ anjungan_youtube: "invalid" })),
    /ID YouTube tidak valid/,
  )
})

test("settings parser preserves a documented relative MP4 media path", () => {
  assert.equal(
    parseAnjunganSettings(validSettings({
      anjungan_profil: "2",
      anjungan_video: "desa/upload/media/profil.mp4",
      anjungan_youtube: "",
    })).anjungan_video,
    "desa/upload/media/profil.mp4",
  )
})

test("only galleries used by active display modes require tenant validation", () => {
  assert.deepEqual(
    activeAnjunganGalleryIds(parseAnjunganSettings(validSettings({
      anjungan_profil: "3",
      anjungan_slide: "99",
      tampilan_anjungan: "0",
      tampilan_anjungan_slider: "88",
    }))),
    [],
  )
  assert.deepEqual(
    activeAnjunganGalleryIds(parseAnjunganSettings(validSettings({
      anjungan_profil: "1",
      anjungan_slide: "12",
      anjungan_youtube: "",
      tampilan_anjungan: "1",
      tampilan_anjungan_slider: "12",
    }))),
    [12],
  )
})

test("settings parser enforces active profile and screensaver dependencies", () => {
  assert.throws(
    () => parseAnjunganSettings(validSettings({
      anjungan_profil: "1",
      anjungan_slide: "",
      anjungan_youtube: "",
    })),
    /Galeri profil wajib dipilih/,
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({
      tampilan_anjungan: "2",
      tampilan_anjungan_slider: "",
      tampilan_anjungan_video: "javascript:alert(1)",
    })),
    /Video screensaver harus berupa/,
  )
  assert.throws(
    () => parseAnjunganSettings(validSettings({ tampilan_anjungan_waktu: "0" })),
    /Waktu screensaver tidak valid/,
  )
})
