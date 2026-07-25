import assert from "node:assert/strict"
import test from "node:test"

import {
  canActivatePamongRole,
  canDeleteLocation,
  canDeletePamong,
  parseAdminRecordId,
  parseBinaryStatusChange,
  parseLocationInput,
  parsePamongInput,
  parsePamongStatusChange,
  resolvePamongIdentity,
  tenantLocationWhere,
  tenantPamongWhere,
  tenantPointWhere,
  tenantScope,
} from "../src/lib/adminDomainScope"

function form(values: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) formData.set(key, value)
  return formData
}

test("pamong input preserves legacy status values and allowlists core fields", () => {
  const input = form({
    pamong_nama: "  Siti Aminah  ",
    gelar_depan: "  Dr. ",
    gelar_belakang: " M.Pd. ",
    pamong_nik: " 3273014401800001 ",
    pamong_niap: "  NIAP-04 ",
    pamong_nip: " 198001042010012001 ",
    pamong_pangkat: " III/c ",
    jabatan_id: "12",
    pamong_status: "2",
    kehadiran: "0",
    config_id: "999",
    pamong_pin: "1234",
    pamong_ttd: "1",
  })

  assert.deepEqual(parsePamongInput(input), {
    pamong_nama: "Siti Aminah",
    gelar_depan: "Dr.",
    gelar_belakang: "M.Pd.",
    pamong_nik: "3273014401800001",
    pamong_niap: "NIAP-04",
    pamong_nip: "198001042010012001",
    pamong_pangkat: "III/c",
    jabatan_id: 12,
    pamong_status: 2,
    kehadiran: 0,
  })
})

test("pamong input rejects blank names and undocumented status values", () => {
  const valid = {
    gelar_depan: "",
    gelar_belakang: "",
    pamong_nik: "",
    pamong_niap: "",
    pamong_nip: "",
    pamong_pangkat: "",
    jabatan_id: "2",
    pamong_status: "1",
    kehadiran: "1",
  }

  assert.throws(
    () => parsePamongInput(form({ ...valid, pamong_nama: " \n " })),
    /Nama pamong wajib diisi/,
  )
  assert.throws(
    () => parsePamongInput(form({ ...valid, pamong_nama: "Siti", pamong_status: "0" })),
    /Status pamong tidak valid/,
  )
  assert.throws(
    () => parsePamongInput(form({ ...valid, pamong_nama: "<img src=x onerror=alert(1)>" })),
    /tidak boleh memuat markup HTML/,
  )
})

test("location input normalizes a valid coordinate pair and strips tenant fields", () => {
  assert.deepEqual(
    parseLocationInput(form({
      nama: "  Balai Pertemuan ",
      desk: "  Gedung serbaguna desa  ",
      ref_point: "8",
      enabled: "1",
      lat: " -6.21462 ",
      lng: " 106.84513 ",
      config_id: "999",
      foto: "../../secret.jpg",
    })),
    {
      nama: "Balai Pertemuan",
      desk: "Gedung serbaguna desa",
      ref_point: 8,
      enabled: 1,
      lat: "-6.21462",
      lng: "106.84513",
    },
  )
})

test("location coordinates must be a complete in-range decimal pair", () => {
  const valid = {
    nama: "Balai Desa",
    desk: "Pusat layanan",
    ref_point: "8",
    enabled: "1",
  }

  assert.throws(
    () => parseLocationInput(form({ ...valid, lat: "-6.2", lng: "" })),
    /Latitude dan longitude harus diisi bersamaan/,
  )
  assert.throws(
    () => parseLocationInput(form({ ...valid, lat: "91", lng: "106.8" })),
    /Latitude harus berada antara -90 dan 90/,
  )
  assert.throws(
    () => parseLocationInput(form({ ...valid, lat: "-6.2", lng: "181" })),
    /Longitude harus berada antara -180 dan 180/,
  )
  assert.throws(
    () => parseLocationInput(form({ ...valid, lat: "1e2", lng: "106.8" })),
    /Koordinat harus berupa angka desimal/,
  )
})

test("location input accepts an intentionally empty coordinate pair", () => {
  assert.deepEqual(
    parseLocationInput(form({
      nama: "Balai Desa",
      desk: "Pusat layanan desa",
      ref_point: "8",
      enabled: "0",
      lat: "",
      lng: "",
    })),
    {
      nama: "Balai Desa",
      desk: "Pusat layanan desa",
      ref_point: 8,
      enabled: 0,
      lat: null,
      lng: null,
    },
  )
})

test("location description is required and rejects stored markup", () => {
  const valid = {
    nama: "Balai Desa",
    ref_point: "8",
    enabled: "1",
    lat: "",
    lng: "",
  }
  assert.throws(
    () => parseLocationInput(form({ ...valid, desk: " \n " })),
    /Keterangan lokasi wajib diisi/,
  )
  assert.throws(
    () => parseLocationInput(form({ ...valid, desk: "<script>alert(1)</script>" })),
    /tidak boleh memuat markup HTML/,
  )
})

test("record and ownership predicates reject cross-tenant or malformed identity", () => {
  assert.equal(parseAdminRecordId(form({ id: "42" })), 42)
  assert.throws(() => parseAdminRecordId(form({ id: "1.5" })), /Data tidak valid/)
  assert.deepEqual(tenantPamongWhere(42, 7), { pamong_id: 42, config_id: 7 })
  assert.deepEqual(tenantLocationWhere(42, 7), { id: 42, config_id: 7 })
  assert.deepEqual(tenantPointWhere(8, 7), {
    id: 8,
    OR: [{ config_id: 7 }, { config_id: null }],
  })
  assert.deepEqual(tenantScope(7), { config_id: 7 })
  assert.throws(() => tenantScope(0), /Tenant tidak valid/)
})

test("pamong deletion is blocked when dependent administration records exist", () => {
  assert.equal(canDeletePamong(0), true)
  assert.equal(canDeletePamong(1), false)
  assert.equal(canDeletePamong(17), false)
  assert.equal(canDeletePamong(0, true), false)
  assert.equal(canDeleteLocation(false), true)
  assert.equal(canDeleteLocation(true), false)
  assert.throws(() => canDeletePamong(-1), /Jumlah relasi tidak valid/)
})

test("status-only mutations accept only their documented legacy domains", () => {
  assert.equal(parsePamongStatusChange(form({ status: "2" })), 2)
  assert.equal(parseBinaryStatusChange(form({ status: "0" })), 0)
  assert.throws(
    () => parsePamongStatusChange(form({ status: "0" })),
    /Status pamong tidak valid/,
  )
  assert.throws(
    () => parseBinaryStatusChange(form({ status: "2" })),
    /Status tidak valid/,
  )
})

test("special pamong roles reject a second active peer", () => {
  assert.equal(canActivatePamongRole(1, false), true)
  assert.equal(canActivatePamongRole(2, false), true)
  assert.equal(canActivatePamongRole(1, true), false)
  assert.equal(canActivatePamongRole(2, true), false)
  assert.equal(canActivatePamongRole(0, true), true)
  assert.equal(canActivatePamongRole(3, true), true)
})

test("resident-backed pamong identity takes precedence without cross-record merging", () => {
  assert.deepEqual(
    resolvePamongIdentity({
      pamongName: null,
      pamongNik: null,
      residentName: "Siti Aminah",
      residentNik: "3273014401800001",
    }),
    { nama: "Siti Aminah", nik: "3273014401800001" },
  )
  assert.deepEqual(
    resolvePamongIdentity({
      pamongName: "Budi Santoso",
      pamongNik: "3273010101800002",
      residentName: null,
      residentNik: null,
    }),
    { nama: "Budi Santoso", nik: "3273010101800002" },
  )
})
