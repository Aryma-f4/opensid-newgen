"use client"

import { useState } from "react"
import { Box, LteTable, Th, Td, Btn, ContentHeader } from "@/components/admin/Ui"
import { createLembaga, updateLembaga, deleteLembaga } from "./actions"

type Lembaga = {
  id: number
  kode: string
  nama: string
  id_master: number
  id_ketua: number | null
  keterangan: string | null
  no_sk_pendirian: string | null
  kategori: string
  ketua: string | null
  anggotaCount: number
}

const emptyForm = { nama: "", kode: "", id_master: "", id_ketua: "", keterangan: "", no_sk_pendirian: "" }

export default function LembagaManager({
  data,
  masterRef,
  pendudukRef,
}: {
  data: Lembaga[]
  masterRef: { id: number; kelompok: string }[]
  pendudukRef: { id: number; nama: string }[]
}) {
  const [items, setItems] = useState(data)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const selectedIds = Array.from(pendingIds)

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await updateLembaga(editing, form)
      else await createLembaga(form)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} data?`)) return
    try { await deleteLembaga(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const openEdit = (item: any) => {
    setForm({
      nama: item.nama, kode: item.kode,
      id_master: String(item.id_master ?? ""),
      id_ketua: String(item.id_ketua ?? ""),
      keterangan: item.keterangan ?? "",
      no_sk_pendirian: item.no_sk_pendirian ?? "",
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <ContentHeader title="Lembaga" subtitle="Daftar Lembaga" breadcrumb={[{ label: "Lembaga" }]} />

      <Box title={`Daftar Lembaga (${items.length})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap gap-2 items-center">
          <Btn color="success" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true) }}>
            <i className="fa fa-plus" /> Tambah
          </Btn>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}><i className="fa fa-trash" /> Hapus</Btn>
          </div>
        )}

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>Kode</Th><Th>Nama Lembaga</Th><Th>Kategori</Th><Th>Ketua</Th><Th>Jml Anggota</Th><Th>No. SK Pendirian</Th><Th>Keterangan</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (<tr><Td colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : items.map((k) => (
            <tr key={k.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(k.id)} onChange={() => toggleSelect(k.id)} /></Td>
              <Td className="font-mono">{k.kode}</Td>
              <Td className="font-medium">{k.nama}</Td>
              <Td>{k.kategori}</Td>
              <Td>{k.ketua ?? "-"}</Td>
              <Td className="text-center">{k.anggotaCount}</Td>
              <Td>{k.no_sk_pendirian ?? "-"}</Td>
              <Td className="max-w-48 truncate">{k.keterangan ?? "-"}</Td>
              <Td className="whitespace-nowrap">
                <Btn color="primary" size="xs" onClick={() => openEdit(k)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([k.id])}><i className="fa fa-trash" /> Hapus</Btn>
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
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Lembaga</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kode <span className="text-red-500">*</span></label>
                    <input type="text" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nama <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kategori <span className="text-red-500">*</span></label>
                  <select value={form.id_master} onChange={(e) => setForm({ ...form, id_master: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="">-- Pilih --</option>
                    {masterRef.filter((m) => m.kelompok).map((m) => (
                      <option key={m.id} value={m.id}>{m.kelompok}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ketua</label>
                  <select value={form.id_ketua} onChange={(e) => setForm({ ...form, id_ketua: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="">-- Pilih --</option>
                    {pendudukRef.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">No. SK Pendirian</label>
                  <input type="text" value={form.no_sk_pendirian} onChange={(e) => setForm({ ...form, no_sk_pendirian: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Keterangan</label>
                  <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" rows={3} />
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
