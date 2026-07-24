import assert from "node:assert/strict"
import test from "node:test"

import {
  canDeleteQuestion,
  parseConfigRecordId,
  parseNeedInput,
  parseQuestionInput,
  satisfactionPageWindow,
  tenantOwnedWhere,
} from "../src/lib/bukuTamuConfig"

function form(values: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) formData.set(key, value)
  return formData
}

test("question input trims a nonempty question and parses the active status", () => {
  assert.deepEqual(
    parseQuestionInput(form({ pertanyaan: "  Apakah pelayanan kami cepat?  ", status: "1" })),
    { pertanyaan: "Apakah pelayanan kami cepat?", status: true },
  )
})

test("question input rejects a blank question", () => {
  assert.throws(
    () => parseQuestionInput(form({ pertanyaan: " \n ", status: "1" })),
    /Pertanyaan wajib diisi/,
  )
})

test("configuration input rejects an unknown status value", () => {
  assert.throws(
    () => parseQuestionInput(form({ pertanyaan: "Pertanyaan", status: "aktif" })),
    /Status tidak valid/,
  )
})

test("need input trims a nonempty need and parses the inactive status", () => {
  assert.deepEqual(
    parseNeedInput(form({ keperluan: "  Konsultasi administrasi  ", status: "0" })),
    { keperluan: "Konsultasi administrasi", status: false },
  )
})

test("need input rejects a blank need", () => {
  assert.throws(
    () => parseNeedInput(form({ keperluan: "\t", status: "1" })),
    /Keperluan wajib diisi/,
  )
})

test("need input rejects text beyond the database limit", () => {
  assert.throws(
    () => parseNeedInput(form({ keperluan: "a".repeat(101), status: "1" })),
    /maksimal 100 karakter/,
  )
})

test("record IDs accept only positive safe integers", () => {
  assert.equal(parseConfigRecordId(form({ id: "42" })), 42)
  assert.throws(() => parseConfigRecordId(form({ id: "0" })), /Data tidak valid/)
  assert.throws(() => parseConfigRecordId(form({ id: "1.5" })), /Data tidak valid/)
})

test("tenant ownership predicate always binds the record and actor config", () => {
  assert.deepEqual(tenantOwnedWhere(42, 7), { id: 42, config_id: 7 })
  assert.throws(() => tenantOwnedWhere(42, 0), /Tenant tidak valid/)
})

test("questions with recorded satisfaction responses cannot be deleted", () => {
  assert.equal(canDeleteQuestion(false), true)
  assert.equal(canDeleteQuestion(true), false)
})

test("satisfaction pagination bounds invalid and oversized page requests", () => {
  assert.deepEqual(satisfactionPageWindow(undefined, 121), {
    page: 1,
    pages: 3,
    skip: 0,
    take: 50,
  })
  assert.deepEqual(satisfactionPageWindow("99", 121), {
    page: 3,
    pages: 3,
    skip: 100,
    take: 50,
  })
  assert.equal(satisfactionPageWindow("-1", 121).page, 1)
  assert.equal(satisfactionPageWindow("abc", 121).page, 1)
})
