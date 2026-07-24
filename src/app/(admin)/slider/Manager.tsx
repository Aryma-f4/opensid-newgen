"use client"

import { useState, useRef } from "react"
import { Btn, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"
import { create, update, deleteSliders } from "./actions"

type Slider = {
  id: number
  judul: string
  gambar: string | null
  isi: string | null
  enabled: number
  slider: boolean
  tgl_upload: Date
}

const emptyForm = { judul: "", isi: "", enabled: "1" }

export default function SliderManager({ data }: { data: Slider[] }) {
  const [items, setItems] = useState(data)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedIds = Array.from(pendingIds)

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const submitData: any = { ...form }

      if (fileInputRef.current?.files?.[0]) {
        submitData._file = fileInputRef.current.files[0]
      }

      if (editing) await update(editing, submitData)
      else await create(submitData)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} slider?`)) return
    try { await deleteSliders(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const openEdit = (item: any) => {
    setForm({
      judul: item.judul ?? "",
      isi: item.isi ?? "",
      enabled: String(item.enabled ?? "1"),
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <Box title={`Daftar Slider (${items.length})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap gap-2 items-center">
          <Btn color="success" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true) }}>
            <i className="fa fa-plus" /> Tambah Slider
          </Btn>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}><i className="fa fa-trash" /> Hapus</Btn>
          </div>
        )}

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>Gambar</Th><Th>Judul</Th><Th>Status</Th><Th>Slider</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (
            <tr><Td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>
          ) : items.map((s) => (
            <tr key={s.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></Td>
              <Td>
                {s.gambar ? (
                  <img src={`/storage/slider/${s.gambar}`} alt={s.judul} className="w-16 h-12 object-cover rounded" />
                ) : (
                  <span className="text-xs text-gray-400">No img</span>
                )}
              </Td>
              <Td className="font-medium max-w-xs truncate">{s.judul}</Td>
              <Td><StatusLabel ok={s.enabled === 1} /></Td>
              <Td>{s.slider ? "Ya" : "Tidak"}</Td>
              <Td className="whitespace-nowrap">
                <Btn color="primary" size="xs" onClick={() => openEdit(s)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([s.id])}><i className="fa fa-trash" /> Hapus</Btn>
              </Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Slider</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Judul <span className="text-red-500">*</span></label>
                  <input type="text" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Upload Gambar</label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="w-full text-sm" />
                  <p className="text-xs text-gray-400 mt-1">Gambar disimpan di storage/slider/</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Konten</label>
                  <textarea value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" rows={4} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
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
