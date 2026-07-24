"use client"

import { useState, useRef } from "react"
import { Btn, ContentHeader, Box, StatusLabel } from "@/components/admin/Ui"
import { createAlbum, updateAlbum, deleteAlbum, uploadPhoto } from "./actions"

type Album = {
  id: number
  nama: string
  gambar: string | null
  enabled: number
  urut: number | null
  fotoCount: number
}

const emptyForm = { nama: "", gambar: "", enabled: "1", urut: "" }

export default function GalleryManager({ data }: { data: Album[] }) {
  const [items, setItems] = useState(data)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const selectedIds = Array.from(pendingIds)

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const submitData: any = { ...form }

      // Upload file if selected
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0]
        submitData._file = file
      }

      if (editing) await updateAlbum(editing, submitData)
      else await createAlbum(submitData)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} album beserta semua foto di dalamnya?`)) return
    try { await deleteAlbum(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const handleUploadPhoto = async (albumId: number) => {
    const input = photoInputRef.current
    if (!input?.files?.[0]) return
    setUploadingPhoto(albumId)
    try {
      const fd = new FormData()
      fd.append("albumId", String(albumId))
      fd.append("file", input.files[0])
      await uploadPhoto(fd)
      input.value = ""
    } catch (err: any) { alert(err.message || "Gagal upload foto") }
    finally { setUploadingPhoto(null) }
  }

  const openEdit = (item: any) => {
    setForm({
      nama: item.nama, gambar: item.gambar ?? "",
      enabled: String(item.enabled ?? "1"),
      urut: String(item.urut ?? ""),
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <ContentHeader title="Galeri" subtitle={`${items.length} album`} breadcrumb={[{ label: "Admin Web" }, { label: "Galeri" }]} />

      <Box title="Album" noPadding>
        <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap gap-2 items-center">
          <Btn color="success" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true) }}>
            <i className="fa fa-plus" /> Tambah Album
          </Btn>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}><i className="fa fa-trash" /> Hapus</Btn>
          </div>
        )}

        <div className="grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <div key={a.id} className="border border-[#f4f4f4] rounded overflow-hidden relative group">
              <div className="absolute top-2 left-2 z-10">
                <input type="checkbox" checked={pendingIds.has(a.id)} onChange={() => toggleSelect(a.id)} />
              </div>
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {a.gambar ? (
                  <img src={`/storage/gallery/${a.gambar}`} alt={a.nama} className="w-full h-full object-cover" />
                ) : (
                  <i className="fa fa-picture-o text-4xl text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <div className="font-medium truncate">{a.nama}</div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>{a.fotoCount} foto</span>
                  <StatusLabel ok={a.enabled === 1} />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    <Btn color="primary" size="xs" onClick={() => openEdit(a)}><i className="fa fa-pencil" /></Btn>
                    <Btn color="danger" size="xs" onClick={() => handleDelete([a.id])}><i className="fa fa-trash" /></Btn>
                  </div>
                  <div className="flex gap-1 items-center">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="text-xs w-36"
                      onChange={() => handleUploadPhoto(a.id)}
                    />
                    {uploadingPhoto === a.id && <span className="text-xs text-blue-500">Uploading...</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">Belum ada album</div>
          )}
        </div>
      </Box>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Album</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nama Album <span className="text-red-500">*</span></label>
                  <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Upload Gambar</label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="w-full text-sm" />
                  {form.gambar && !editing && (
                    <p className="text-xs text-gray-400 mt-1">Atau masukkan nama file: {form.gambar}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Urutan</label>
                    <input type="number" value={form.urut} onChange={(e) => setForm({ ...form, urut: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <Btn type="button" color="default" onClick={() => setShowForm(false)}>Batal</Btn>
                <Btn type="submit" color="success" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
