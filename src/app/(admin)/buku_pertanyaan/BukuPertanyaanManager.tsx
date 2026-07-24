"use client"

import { useState } from "react"

import { Box, Btn, ContentHeader, LteTable, StatusLabel, Td, Th } from "@/components/admin/Ui"

import { createQuestion, deleteQuestion, updateQuestion } from "./actions"

export type QuestionRow = {
  id: number
  pertanyaan: string
  status: boolean
}

type FormMode = "create" | "edit"

export default function BukuPertanyaanManager({
  rows,
  canUpdate,
  canDelete,
}: {
  rows: QuestionRow[]
  canUpdate: boolean
  canDelete: boolean
}) {
  const [mode, setMode] = useState<FormMode | null>(null)
  const [editing, setEditing] = useState<QuestionRow | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function openCreate() {
    setEditing(null)
    setError("")
    setMode("create")
  }

  function openEdit(row: QuestionRow) {
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
        ? await updateQuestion(formData)
        : await createQuestion(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setMode(null)
      setEditing(null)
    } catch {
      setError("Pertanyaan gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: QuestionRow) {
    if (!window.confirm("Hapus pertanyaan ini? Pertanyaan yang sudah memiliki jawaban kepuasan tidak dapat dihapus.")) return

    setDeletingId(row.id)
    setError("")
    try {
      const formData = new FormData()
      formData.set("id", String(row.id))
      const result = await deleteQuestion(formData)
      if (!result.success) setError(result.error)
    } catch {
      setError("Pertanyaan gagal dihapus.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Data Pertanyaan"
        subtitle="Pertanyaan indeks kepuasan buku tamu"
        breadcrumb={[{ label: "Buku Tamu" }, { label: "Data Pertanyaan" }]}
      />
      <Box title={`Data Pertanyaan (${rows.length})`} noPadding>
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
              <Th className="w-14">No.</Th>
              <Th>Pertanyaan</Th>
              <Th className="w-24">Tampil</Th>
              <Th className="w-40">Aksi</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={4} className="py-8 text-center text-gray-400">
                Belum ada pertanyaan
              </Td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={row.id}>
              <Td>{index + 1}</Td>
              <Td>{row.pertanyaan}</Td>
              <Td><StatusLabel ok={row.status} yes="Ya" no="Tidak" /></Td>
              <Td>
                <div className="flex gap-1">
                  {canUpdate && (
                    <Btn color="warning" size="xs" onClick={() => openEdit(row)}>
                      <i className="fa fa-pencil" aria-hidden="true" /> Ubah
                    </Btn>
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
            className="mx-4 mb-12 w-full max-w-xl rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-form-title"
          >
            <form action={submit}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 id="question-form-title" className="m-0 text-lg font-bold">
                  {mode === "edit" ? "Ubah Pertanyaan" : "Tambah Pertanyaan"}
                </h2>
                <button type="button" onClick={closeForm} className="text-2xl leading-none text-gray-400 hover:text-gray-600" aria-label="Tutup formulir">
                  &times;
                </button>
              </div>
              <div className="space-y-4 p-6">
                {error && <p className="m-0 text-sm text-red-700" role="alert">{error}</p>}
                {editing && <input type="hidden" name="id" value={editing.id} />}
                <div>
                  <label htmlFor="pertanyaan" className="mb-1 block text-sm font-medium">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="pertanyaan"
                    name="pertanyaan"
                    defaultValue={editing?.pertanyaan ?? ""}
                    required
                    rows={5}
                    className="form-control"
                    placeholder="Isi pertanyaan"
                  />
                </div>
                <div className="max-w-xs">
                  <label htmlFor="status" className="mb-1 block text-sm font-medium">Tampil</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editing ? (editing.status ? "1" : "0") : "1"}
                    className="form-control input-sm"
                  >
                    <option value="1">Ya</option>
                    <option value="0">Tidak</option>
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
