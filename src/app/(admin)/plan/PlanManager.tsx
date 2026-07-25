"use client"

import { useState } from "react"

import {
  Box,
  Btn,
  ContentHeader,
  LteTable,
  StatusLabel,
  Td,
  Th,
} from "@/components/admin/Ui"

import {
  changeLocationStatus,
  createLocation,
  deleteLocation,
  updateLocation,
} from "./actions"

export type LocationPoint = {
  id: number
  nama: string
  enabled: boolean
}

export type LocationRow = {
  id: number
  nama: string
  desk: string
  enabled: boolean
  lat: string | null
  lng: string | null
  refPoint: number | null
  kategori: string
}

type FormMode = "create" | "edit"

export default function PlanManager({
  rows,
  points,
  canUpdate,
  canDelete,
}: {
  rows: LocationRow[]
  points: LocationPoint[]
  canUpdate: boolean
  canDelete: boolean
}) {
  const [mode, setMode] = useState<FormMode | null>(null)
  const [editing, setEditing] = useState<LocationRow | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState<number | null>(null)

  function openCreate() {
    setEditing(null)
    setError("")
    setMode("create")
  }

  function openEdit(row: LocationRow) {
    setEditing(row)
    setError("")
    setMode("edit")
  }

  function closeForm() {
    if (saving) return
    setEditing(null)
    setMode(null)
    setError("")
  }

  async function submit(formData: FormData) {
    setSaving(true)
    setError("")
    try {
      const result = mode === "edit"
        ? await updateLocation(formData)
        : await createLocation(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setEditing(null)
      setMode(null)
    } catch {
      setError("Lokasi gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(row: LocationRow) {
    setWorkingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      formData.set("status", row.enabled ? "0" : "1")
      const result = await changeLocationStatus(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Status lokasi gagal diubah.")
    } finally {
      setWorkingId(null)
    }
  }

  async function remove(row: LocationRow) {
    if (!window.confirm(`Hapus lokasi “${row.nama}”?`)) return

    setWorkingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      const result = await deleteLocation(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Lokasi gagal dihapus.")
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Pengaturan Lokasi"
        subtitle="Daftar titik lokasi dan koordinat dasar"
        breadcrumb={[{ label: "Pemetaan" }, { label: "Pengaturan Lokasi" }]}
      />

      <Box title={`Daftar Lokasi (${rows.length})`} noPadding>
        <div className="border-b border-[#f4f4f4] p-3">
          {canUpdate && points.length > 0 && (
            <Btn color="success" onClick={openCreate}>
              <i className="fa fa-plus" aria-hidden="true" /> Tambah Lokasi
            </Btn>
          )}
          {points.length === 0 && (
            <p className="mb-0 text-sm text-yellow-700">
              Belum ada kategori point tenant yang dapat digunakan untuk lokasi.
            </p>
          )}
          {error && !mode && (
            <p className="mb-0 mt-2 text-sm text-red-700" role="alert">{error}</p>
          )}
        </div>

        <LteTable
          head={
            <>
              <Th className="w-14">No.</Th>
              <Th>Nama</Th>
              <Th>Kategori</Th>
              <Th>Koordinat</Th>
              <Th>Keterangan</Th>
              <Th className="w-24">Status</Th>
              <Th className="w-52">Aksi</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={7} className="py-8 text-center text-gray-400">
                Belum ada lokasi
              </Td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={row.id}>
              <Td>{index + 1}</Td>
              <Td className="font-medium">{row.nama}</Td>
              <Td>{row.kategori}</Td>
              <Td>{row.lat && row.lng ? `${row.lat}, ${row.lng}` : "Belum diisi"}</Td>
              <Td className="max-w-md whitespace-pre-wrap">{row.desk || "-"}</Td>
              <Td><StatusLabel ok={row.enabled} /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {canUpdate && (
                    <>
                      <Btn color="warning" size="xs" onClick={() => openEdit(row)}>
                        <i className="fa fa-pencil" aria-hidden="true" /> Ubah
                      </Btn>
                      <Btn
                        color={row.enabled ? "default" : "success"}
                        size="xs"
                        onClick={() => toggleStatus(row)}
                        disabled={workingId === row.id}
                      >
                        {row.enabled ? "Nonaktifkan" : "Aktifkan"}
                      </Btn>
                    </>
                  )}
                  {canDelete && (
                    <Btn
                      color="danger"
                      size="xs"
                      onClick={() => remove(row)}
                      disabled={workingId === row.id}
                    >
                      <i className="fa fa-trash" aria-hidden="true" /> Hapus
                    </Btn>
                  )}
                  {!canUpdate && !canDelete && <span className="text-gray-400">-</span>}
                </div>
              </Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <Box color="info" title="Batas Fitur Peta">
        <p className="mb-0 text-sm text-gray-600">
          Koordinat dapat dikelola di sini, tetapi pemilihan titik pada peta, simbol,
          foto lokasi, dan gambar GIS belum tersedia sampai layanan peta interaktif
          dipindahkan ke NewGen.
        </p>
      </Box>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12" role="presentation">
          <div
            className="mx-4 mb-12 w-full max-w-2xl rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-form-title"
          >
            <form action={submit}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 id="location-form-title" className="m-0 text-lg font-bold">
                  {mode === "edit" ? "Ubah Lokasi" : "Tambah Lokasi"}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                  aria-label="Tutup formulir"
                >
                  &times;
                </button>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {error && <p className="m-0 text-sm text-red-700 sm:col-span-2" role="alert">{error}</p>}
                {editing && <input type="hidden" name="id" value={editing.id} />}

                <div className="sm:col-span-2">
                  <label htmlFor="nama" className="mb-1 block text-sm font-medium">
                    Nama Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input id="nama" name="nama" maxLength={50} required defaultValue={editing?.nama ?? ""} className="form-control input-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ref_point" className="mb-1 block text-sm font-medium">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select id="ref_point" name="ref_point" required defaultValue={editing?.refPoint ?? ""} className="form-control input-sm">
                    <option value="" disabled>Pilih kategori</option>
                    {points.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.nama}{point.enabled ? "" : " (nonaktif)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lat" className="mb-1 block text-sm font-medium">Latitude</label>
                  <input id="lat" name="lat" inputMode="decimal" maxLength={30} defaultValue={editing?.lat ?? ""} placeholder="-6.21462" className="form-control input-sm" />
                </div>
                <div>
                  <label htmlFor="lng" className="mb-1 block text-sm font-medium">Longitude</label>
                  <input id="lng" name="lng" inputMode="decimal" maxLength={30} defaultValue={editing?.lng ?? ""} placeholder="106.84513" className="form-control input-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="desk" className="mb-1 block text-sm font-medium">
                    Keterangan <span className="text-red-500">*</span>
                  </label>
                  <textarea id="desk" name="desk" rows={5} required defaultValue={editing?.desk ?? ""} className="form-control" />
                </div>
                <div>
                  <label htmlFor="enabled" className="mb-1 block text-sm font-medium">Status</label>
                  <select id="enabled" name="enabled" defaultValue={editing ? (editing.enabled ? "1" : "0") : "1"} className="form-control input-sm">
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                <Btn type="button" color="default" onClick={closeForm} disabled={saving}>Batal</Btn>
                <Btn type="submit" color="info" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
