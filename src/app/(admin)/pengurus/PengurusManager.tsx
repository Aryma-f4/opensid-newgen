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
  changePamongAttendance,
  changePamongStatus,
  createPamong,
  deletePamong,
  updatePamong,
} from "./actions"

export type PamongJob = {
  id: number
  nama: string
}

export type PamongRow = {
  id: number
  nama: string
  gelarDepan: string
  gelarBelakang: string
  nik: string
  niap: string
  nip: string
  pangkat: string
  residentBacked: boolean
  jabatanId: number | null
  jabatan: string
  status: 1 | 2
  kehadiran: boolean
}

type FormMode = "create" | "edit"

function displayName(row: PamongRow): string {
  return [row.gelarDepan, row.nama, row.gelarBelakang].filter(Boolean).join(" ")
}

export default function PengurusManager({
  rows,
  jobs,
  canUpdate,
  canDelete,
}: {
  rows: PamongRow[]
  jobs: PamongJob[]
  canUpdate: boolean
  canDelete: boolean
}) {
  const [mode, setMode] = useState<FormMode | null>(null)
  const [editing, setEditing] = useState<PamongRow | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState<number | null>(null)

  function openCreate() {
    setEditing(null)
    setError("")
    setMode("create")
  }

  function openEdit(row: PamongRow) {
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
        ? await updatePamong(formData)
        : await createPamong(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setEditing(null)
      setMode(null)
    } catch {
      setError("Pamong gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(row: PamongRow) {
    setWorkingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      formData.set("status", row.status === 1 ? "2" : "1")
      const result = await changePamongStatus(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Status pamong gagal diubah.")
    } finally {
      setWorkingId(null)
    }
  }

  async function setAttendance(row: PamongRow) {
    setWorkingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      formData.set("status", row.kehadiran ? "0" : "1")
      const result = await changePamongAttendance(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Status kehadiran gagal diubah.")
    } finally {
      setWorkingId(null)
    }
  }

  async function remove(row: PamongRow) {
    if (!window.confirm(`Hapus pamong “${displayName(row)}”?`)) return

    setWorkingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      const result = await deletePamong(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Pamong gagal dihapus.")
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Pemerintah Desa"
        subtitle="Data inti pamong dan status pelayanan"
        breadcrumb={[{ label: "Buku Administrasi Umum" }, { label: "Pemerintah Desa" }]}
      />

      <Box title={`Daftar Pamong (${rows.length})`} noPadding>
        <div className="border-b border-[#f4f4f4] p-3">
          {canUpdate && jobs.length > 0 && (
            <Btn color="success" onClick={openCreate}>
              <i className="fa fa-plus" aria-hidden="true" /> Tambah Pamong
            </Btn>
          )}
          {jobs.length === 0 && (
            <p className="mb-0 text-sm text-yellow-700">
              Tambahkan referensi jabatan tenant terlebih dahulu sebelum membuat pamong.
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
              <Th>Identitas</Th>
              <Th>Jabatan</Th>
              <Th>Pangkat</Th>
              <Th className="w-24">Status</Th>
              <Th className="w-28">Kehadiran</Th>
              <Th className="w-72">Aksi</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={7} className="py-8 text-center text-gray-400">
                Belum ada data pamong
              </Td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={row.id}>
              <Td>{index + 1}</Td>
              <Td>
                <div className="font-medium">{displayName(row)}</div>
                <div className="text-xs text-gray-500">
                  NIK: {row.nik || "-"} · NIAP: {row.niap || "-"} · NIP: {row.nip || "-"}
                </div>
              </Td>
              <Td>{row.jabatan}</Td>
              <Td>{row.pangkat || "-"}</Td>
              <Td><StatusLabel ok={row.status === 1} /></Td>
              <Td><StatusLabel ok={row.kehadiran} yes="Dicatat" no="Tidak" /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {canUpdate && (
                    <>
                      <Btn color="warning" size="xs" onClick={() => openEdit(row)}>
                        <i className="fa fa-pencil" aria-hidden="true" /> Ubah
                      </Btn>
                      <Btn
                        color={row.status === 1 ? "default" : "success"}
                        size="xs"
                        onClick={() => setStatus(row)}
                        disabled={workingId === row.id}
                      >
                        {row.status === 1 ? "Nonaktifkan" : "Aktifkan"}
                      </Btn>
                      <Btn
                        color="info"
                        size="xs"
                        onClick={() => setAttendance(row)}
                        disabled={workingId === row.id}
                      >
                        {row.kehadiran ? "Matikan Kehadiran" : "Aktifkan Kehadiran"}
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

      <Box color="info" title="Batas Port Saat Ini">
        <p className="mb-0 text-sm text-gray-600">
          Halaman ini menangani data inti dan status pamong. Cetak daftar, bagan organisasi,
          foto, penandatangan a.n/u.b., dan pengaturan jabatan lanjutan tetap dijadwalkan
          untuk port dokumen dan tata letak berikutnya.
        </p>
      </Box>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12" role="presentation">
          <div
            className="mx-4 mb-12 w-full max-w-3xl rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pamong-form-title"
          >
            <form action={submit}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 id="pamong-form-title" className="m-0 text-lg font-bold">
                  {mode === "edit" ? "Ubah Pamong" : "Tambah Pamong"}
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
                  <label htmlFor="pamong_nama" className="mb-1 block text-sm font-medium">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pamong_nama"
                    name="pamong_nama"
                    maxLength={100}
                    required
                    readOnly={editing?.residentBacked}
                    defaultValue={editing?.nama ?? ""}
                    className="form-control input-sm"
                  />
                  {editing?.residentBacked && (
                    <p className="mb-0 mt-1 text-xs text-gray-500">
                      Nama mengikuti data penduduk tertaut dan diubah dari modul Penduduk.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="gelar_depan" className="mb-1 block text-sm font-medium">Gelar Depan</label>
                  <input id="gelar_depan" name="gelar_depan" maxLength={100} defaultValue={editing?.gelarDepan ?? ""} className="form-control input-sm" />
                </div>
                <div>
                  <label htmlFor="gelar_belakang" className="mb-1 block text-sm font-medium">Gelar Belakang</label>
                  <input id="gelar_belakang" name="gelar_belakang" maxLength={100} defaultValue={editing?.gelarBelakang ?? ""} className="form-control input-sm" />
                </div>
                <div>
                  <label htmlFor="pamong_nik" className="mb-1 block text-sm font-medium">NIK</label>
                  <input
                    id="pamong_nik"
                    name="pamong_nik"
                    maxLength={20}
                    readOnly={editing?.residentBacked}
                    defaultValue={editing?.nik ?? ""}
                    className="form-control input-sm"
                  />
                </div>
                <div>
                  <label htmlFor="pamong_niap" className="mb-1 block text-sm font-medium">NIAP</label>
                  <input id="pamong_niap" name="pamong_niap" maxLength={25} defaultValue={editing?.niap ?? ""} className="form-control input-sm" />
                </div>
                <div>
                  <label htmlFor="pamong_nip" className="mb-1 block text-sm font-medium">NIP</label>
                  <input id="pamong_nip" name="pamong_nip" maxLength={20} defaultValue={editing?.nip ?? ""} className="form-control input-sm" />
                </div>
                <div>
                  <label htmlFor="pamong_pangkat" className="mb-1 block text-sm font-medium">Pangkat / Golongan</label>
                  <input id="pamong_pangkat" name="pamong_pangkat" maxLength={20} defaultValue={editing?.pangkat ?? ""} className="form-control input-sm" />
                </div>
                <div>
                  <label htmlFor="jabatan_id" className="mb-1 block text-sm font-medium">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <select id="jabatan_id" name="jabatan_id" required defaultValue={editing?.jabatanId ?? ""} className="form-control input-sm">
                    <option value="" disabled>Pilih jabatan</option>
                    {jobs.map((job) => <option key={job.id} value={job.id}>{job.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="pamong_status" className="mb-1 block text-sm font-medium">Status Pamong</label>
                  <select id="pamong_status" name="pamong_status" defaultValue={editing?.status ?? 1} className="form-control input-sm">
                    <option value="1">Aktif</option>
                    <option value="2">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="kehadiran" className="mb-1 block text-sm font-medium">Pencatatan Kehadiran</label>
                  <select id="kehadiran" name="kehadiran" defaultValue={editing ? (editing.kehadiran ? "1" : "0") : "1"} className="form-control input-sm">
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
