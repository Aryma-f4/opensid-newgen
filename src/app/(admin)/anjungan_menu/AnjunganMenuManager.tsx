"use client"

import { useState } from "react"

import { Box, Btn, ContentHeader, LteTable, StatusLabel, Td, Th } from "@/components/admin/Ui"

import {
  createAnjunganMenu,
  deleteAnjunganMenu,
  reorderAnjunganMenus,
  updateAnjunganMenu,
} from "./actions"

export type AnjunganMenuRow = {
  id: number
  nama: string
  icon: string | null
  link: string
  linkTipe: number
  urut: number
  status: boolean
}

type FormMode = "create" | "edit"

const linkTypes = [
  [1, "Artikel Statis"],
  [2, "Statistik Penduduk"],
  [3, "Statistik Keluarga"],
  [4, "Statistik Program Bantuan"],
  [5, "Halaman Statis Lainnya"],
  [6, "Artikel Keuangan"],
  [7, "Kelompok"],
  [8, "Kategori Artikel"],
  [9, "Suplemen"],
  [10, "Status IDM"],
  [11, "Lembaga"],
  [12, "Statistik Kesehatan"],
  [99, "Tautan Eksternal"],
] as const

function linkTypeLabel(value: number): string {
  return linkTypes.find(([id]) => id === value)?.[1] ?? `Tipe ${value}`
}

export default function AnjunganMenuManager({
  rows,
  canUpdate,
  canDelete,
}: {
  rows: AnjunganMenuRow[]
  canUpdate: boolean
  canDelete: boolean
}) {
  const [mode, setMode] = useState<FormMode | null>(null)
  const [editing, setEditing] = useState<AnjunganMenuRow | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [reorderingId, setReorderingId] = useState<number | null>(null)

  function openCreate() {
    setEditing(null)
    setError("")
    setMode("create")
  }

  function openEdit(row: AnjunganMenuRow) {
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
        ? await updateAnjunganMenu(formData)
        : await createAnjunganMenu(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setEditing(null)
      setMode(null)
    } catch {
      setError("Menu anjungan gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: AnjunganMenuRow) {
    if (!window.confirm(`Hapus menu “${row.nama}”?`)) return

    setDeletingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      const result = await deleteAnjunganMenu(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Menu anjungan gagal dihapus.")
    } finally {
      setDeletingId(null)
    }
  }

  async function move(index: number, offset: -1 | 1) {
    const target = index + offset
    if (target < 0 || target >= rows.length) return

    const nextRows = [...rows]
    const [moved] = nextRows.splice(index, 1)
    nextRows.splice(target, 0, moved)
    setReorderingId(moved.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("order", JSON.stringify(nextRows.map((row) => row.id)))
      const result = await reorderAnjunganMenus(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Urutan menu anjungan gagal disimpan.")
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Menu Anjungan"
        subtitle="Susunan menu layanan pada layar anjungan"
        breadcrumb={[{ label: "Anjungan" }, { label: "Menu" }]}
      />

      <Box title={`Daftar Menu (${rows.length})`} noPadding>
        <div className="border-b border-[#f4f4f4] p-3">
          {canUpdate && (
            <Btn color="success" onClick={openCreate}>
              <i className="fa fa-plus" aria-hidden="true" /> Tambah
            </Btn>
          )}
          {error && !mode && (
            <p className="mb-0 mt-2 text-sm text-red-700" role="alert">{error}</p>
          )}
        </div>

        <LteTable
          head={
            <>
              <Th className="w-16">Urut</Th>
              <Th>Nama</Th>
              <Th>Jenis Link</Th>
              <Th>Link</Th>
              <Th className="w-24">Status</Th>
              <Th className="w-64">Aksi</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={6} className="py-8 text-center text-gray-400">
                Belum ada menu anjungan
              </Td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={row.id}>
              <Td>{index + 1}</Td>
              <Td>
                <div className="font-medium">{row.nama}</div>
                {row.icon && <div className="text-xs text-gray-500">Ikon: {row.icon}</div>}
              </Td>
              <Td>{linkTypeLabel(row.linkTipe)}</Td>
              <Td className="max-w-sm break-all">{row.link}</Td>
              <Td><StatusLabel ok={row.status} yes="Aktif" no="Nonaktif" /></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {canUpdate && (
                    <>
                      <Btn
                        color="default"
                        size="xs"
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || reorderingId !== null}
                        title="Naikkan urutan"
                      >
                        <i className="fa fa-arrow-up" aria-hidden="true" />
                      </Btn>
                      <Btn
                        color="default"
                        size="xs"
                        onClick={() => move(index, 1)}
                        disabled={index === rows.length - 1 || reorderingId !== null}
                        title="Turunkan urutan"
                      >
                        <i className="fa fa-arrow-down" aria-hidden="true" />
                      </Btn>
                      <Btn color="warning" size="xs" onClick={() => openEdit(row)}>
                        <i className="fa fa-pencil" aria-hidden="true" /> Ubah
                      </Btn>
                    </>
                  )}
                  {canDelete && (
                    <Btn
                      color="danger"
                      size="xs"
                      onClick={() => remove(row)}
                      disabled={deletingId === row.id}
                    >
                      <i className="fa fa-trash" aria-hidden="true" /> {deletingId === row.id ? "..." : "Hapus"}
                    </Btn>
                  )}
                  {!canUpdate && !canDelete && <span className="text-gray-400">-</span>}
                </div>
              </Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12" role="presentation">
          <div
            className="mx-4 mb-12 w-full max-w-2xl rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="anjungan-menu-form-title"
          >
            <form action={submit}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 id="anjungan-menu-form-title" className="m-0 text-lg font-bold">
                  {mode === "edit" ? "Ubah Menu Anjungan" : "Tambah Menu Anjungan"}
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

              <div className="space-y-4 p-6">
                {error && <p className="m-0 text-sm text-red-700" role="alert">{error}</p>}
                {editing && <input type="hidden" name="id" value={editing.id} />}

                <div>
                  <label htmlFor="nama" className="mb-1 block text-sm font-medium">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nama"
                    name="nama"
                    type="text"
                    maxLength={50}
                    defaultValue={editing?.nama ?? ""}
                    required
                    className="form-control input-sm"
                  />
                </div>

                <div>
                  <label htmlFor="link_tipe" className="mb-1 block text-sm font-medium">
                    Jenis Link <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="link_tipe"
                    name="link_tipe"
                    defaultValue={editing?.linkTipe ?? 5}
                    required
                    className="form-control input-sm"
                  >
                    {linkTypes.map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="link" className="mb-1 block text-sm font-medium">
                    Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="link"
                    name="link"
                    type="text"
                    maxLength={2048}
                    defaultValue={editing?.link ?? ""}
                    required
                    className="form-control input-sm"
                    placeholder="Contoh: profil atau https://opendesa.id"
                  />
                  <p className="mb-0 mt-1 text-xs text-gray-500">
                    Gunakan path OpenSID untuk link internal; jenis eksternal hanya menerima HTTP/HTTPS.
                  </p>
                </div>

                <div className="max-w-xs">
                  <label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editing ? (editing.status ? "1" : "0") : "1"}
                    className="form-control input-sm"
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>

                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Unggah ikon belum tersedia di NewGen. Ikon lama tetap dipertahankan saat menu diubah.
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
