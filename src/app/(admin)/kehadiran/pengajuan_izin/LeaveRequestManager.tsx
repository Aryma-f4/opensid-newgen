"use client"

import { useState } from "react"

import { Box, Btn, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { leaveRequestErrorMessage } from "@/lib/kehadiranLeave"

import { createLeaveRequest, deleteLeaveRequest, updateLeaveRequest } from "./actions"

export type LeaveRequestRow = {
  id: string
  jenisIzin: string
  tanggalMulai: string
  tanggalSelesai: string
  keterangan: string
  status: string
}

type FormMode = "create" | "edit"

const leaveTypes = [
  ["izin", "Izin"],
  ["sakit", "Sakit"],
  ["dinas_luar_kota", "Dinas luar kota"],
  ["cuti", "Cuti"],
  ["lainnya", "Lainnya"],
] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value))
}

function isPending(status: string) {
  return status === "pending"
}

function statusLabel(status: string) {
  if (status === "approved") return "Disetujui"
  if (status === "rejected") return "Ditolak"
  return "Menunggu"
}

function statusClass(status: string) {
  if (status === "approved") return "label label-success"
  if (status === "rejected") return "label label-danger"
  return "label label-warning"
}

export default function LeaveRequestManager({ rows }: { rows: LeaveRequestRow[] }) {
  const [mode, setMode] = useState<FormMode | null>(null)
  const [editing, setEditing] = useState<LeaveRequestRow | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setError("")
    setMode("create")
  }

  function openEdit(row: LeaveRequestRow) {
    setEditing(row)
    setError("")
    setMode("edit")
  }

  function closeForm() {
    if (saving) return
    setMode(null)
    setEditing(null)
    setError("")
  }

  async function submit(formData: FormData) {
    setSaving(true)
    setError("")
    try {
      const result = mode === "edit"
        ? await updateLeaveRequest(formData)
        : await createLeaveRequest(formData)
      if (!result.success) {
        setError(leaveRequestErrorMessage(result.error))
        return
      }
      setMode(null)
      setEditing(null)
    } catch {
      setError(leaveRequestErrorMessage("save_failed"))
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: LeaveRequestRow) {
    if (!window.confirm("Hapus pengajuan izin ini?")) return

    setDeletingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("request_id", row.id)
      const result = await deleteLeaveRequest(formData)
      if (!result.success) setError(leaveRequestErrorMessage(result.error))
    } catch {
      setError(leaveRequestErrorMessage("delete_failed"))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Pengajuan Izin"
        subtitle="Ajukan dan pantau izin Anda"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Pengajuan Izin" }]}
      />
      <Box title={`Pengajuan Izin Saya (${rows.length})`} noPadding>
        <div className="border-b border-[#f4f4f4] p-3">
          <Btn color="success" onClick={openCreate}>
            <i className="fa fa-plus" aria-hidden="true" /> Ajukan Izin
          </Btn>
          <p className="mb-0 mt-2 text-sm text-gray-600">
            Pengajuan dapat diubah atau dihapus selama masih menunggu persetujuan.
          </p>
          {error && !mode && (
            <p className="mb-0 mt-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
        <LteTable
          head={
            <>
              <Th>Jenis Izin</Th>
              <Th>Mulai</Th>
              <Th>Selesai</Th>
              <Th>Keterangan</Th>
              <Th>Status</Th>
              <Th className="w-28">Aksi</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={6} className="py-8 text-center text-gray-400">
                Belum ada pengajuan izin
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{leaveTypes.find(([value]) => value === row.jenisIzin)?.[1] ?? row.jenisIzin}</Td>
                <Td>{formatDate(row.tanggalMulai)}</Td>
                <Td>{formatDate(row.tanggalSelesai)}</Td>
                <Td>{row.keterangan}</Td>
                <Td><span className={statusClass(row.status)}>{statusLabel(row.status)}</span></Td>
                <Td>
                  {isPending(row.status) ? (
                    <div className="flex gap-1">
                      <Btn color="primary" size="xs" onClick={() => openEdit(row)} aria-label="Ubah pengajuan izin">
                        <i className="fa fa-pencil" aria-hidden="true" /> Ubah
                      </Btn>
                      <Btn
                        color="danger"
                        size="xs"
                        onClick={() => remove(row)}
                        disabled={deletingId === row.id}
                        aria-label="Hapus pengajuan izin"
                      >
                        <i className="fa fa-trash" aria-hidden="true" /> {deletingId === row.id ? "..." : "Hapus"}
                      </Btn>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Tidak dapat diubah</span>
                  )}
                </Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12" role="presentation">
          <div
            className="mb-12 mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-request-title"
          >
            <form action={submit}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 id="leave-request-title" className="m-0 text-lg font-bold">
                  {mode === "edit" ? "Ubah Pengajuan Izin" : "Ajukan Izin"}
                </h2>
                <button type="button" onClick={closeForm} className="text-2xl leading-none text-gray-400 hover:text-gray-600" aria-label="Tutup formulir">
                  &times;
                </button>
              </div>
              <div className="space-y-4 p-6">
                {error && <p className="m-0 text-sm text-red-700" role="alert">{error}</p>}
                {editing && <input type="hidden" name="request_id" value={editing.id} />}
                <div>
                  <label htmlFor="jenis_izin" className="mb-1 block text-xs text-gray-500">Jenis izin <span className="text-red-500">*</span></label>
                  <select id="jenis_izin" name="jenis_izin" defaultValue={editing?.jenisIzin ?? "izin"} required className="form-control input-sm">
                    {leaveTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tanggal_mulai" className="mb-1 block text-xs text-gray-500">Tanggal mulai <span className="text-red-500">*</span></label>
                    <input id="tanggal_mulai" type="date" name="tanggal_mulai" defaultValue={editing?.tanggalMulai.slice(0, 10)} required className="form-control input-sm" />
                  </div>
                  <div>
                    <label htmlFor="tanggal_selesai" className="mb-1 block text-xs text-gray-500">Tanggal selesai <span className="text-red-500">*</span></label>
                    <input id="tanggal_selesai" type="date" name="tanggal_selesai" defaultValue={editing?.tanggalSelesai.slice(0, 10)} required className="form-control input-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="keterangan" className="mb-1 block text-xs text-gray-500">Keterangan <span className="text-red-500">*</span></label>
                  <textarea id="keterangan" name="keterangan" defaultValue={editing?.keterangan ?? ""} required rows={4} className="form-control" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                <Btn type="button" color="default" onClick={closeForm} disabled={saving}>Batal</Btn>
                <Btn type="submit" color="success" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
