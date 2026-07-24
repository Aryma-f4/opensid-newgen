import assert from "node:assert/strict"
import test from "node:test"

import { canChangePending, leaveDates, parseLeaveInput } from "../src/lib/kehadiranLeave"

test("requires a leave type", () => {
  assert.throws(() => parseLeaveInput(new FormData()), /Jenis izin/)
})

test("parses allowed leave input and trims its note", () => {
  const formData = new FormData()
  formData.set("jenis_izin", "cuti")
  formData.set("tanggal_mulai", "2026-07-24")
  formData.set("tanggal_selesai", "2026-07-26")
  formData.set("keterangan", "  Perjalanan keluarga  ")

  const input = parseLeaveInput(formData)

  assert.equal(input.jenis_izin, "cuti")
  assert.equal(input.tanggal_mulai.toISOString().slice(0, 10), "2026-07-24")
  assert.equal(input.tanggal_selesai.toISOString().slice(0, 10), "2026-07-26")
  assert.equal(input.keterangan, "Perjalanan keluarga")
})

test("requires a nonempty leave note after trimming", () => {
  const formData = new FormData()
  formData.set("jenis_izin", "izin")
  formData.set("tanggal_mulai", "2026-07-24")
  formData.set("tanggal_selesai", "2026-07-24")
  formData.set("keterangan", "   ")

  assert.throws(() => parseLeaveInput(formData), /Keterangan/)
})

test("rejects invalid leave ranges", () => {
  const formData = new FormData()
  formData.set("jenis_izin", "izin")
  formData.set("tanggal_mulai", "2026-07-26")
  formData.set("tanggal_selesai", "2026-07-24")
  formData.set("keterangan", "Tanggal keliru")

  assert.throws(() => parseLeaveInput(formData), /selesai/)
})

test("parses early four-digit years without JavaScript's 1900 offset", () => {
  const formData = new FormData()
  formData.set("jenis_izin", "izin")
  formData.set("tanggal_mulai", "0001-01-01")
  formData.set("tanggal_selesai", "0001-01-01")
  formData.set("keterangan", "Tanggal awal")

  const input = parseLeaveInput(formData)

  assert.equal(input.tanggal_mulai.toISOString().slice(0, 10), "0001-01-01")
})

test("returns every date in an inclusive leave range", () => {
  assert.deepEqual(
    leaveDates(new Date("2026-07-24"), new Date("2026-07-26")).map((date) =>
      date.toISOString().slice(0, 10),
    ),
    ["2026-07-24", "2026-07-25", "2026-07-26"],
  )
})

test("allows pending requests to change but rejects non-pending requests", () => {
  assert.equal(canChangePending("pending"), true)
  assert.equal(canChangePending("approved"), false)
  assert.equal(canChangePending("rejected"), false)
})
