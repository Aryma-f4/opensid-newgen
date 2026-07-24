"use client"

import { useState } from "react"
import { Box, LteTable, Th, Td, Btn, ContentHeader, StatusLabel } from "@/components/admin/Ui"
import { createSurat, updateSurat, deleteSurat } from "./actions"

const jenisLabel: Record<number, string> = { 1: "Sistem", 2: "Desa", 3: "Disabled", 4: "RTF Sistem" }

type Surat = {
  id: number
  nama: string
  url_surat: string
  kode_surat: string | null
  jenis: number
  mandiri: boolean
  favorit: boolean
  kunci: boolean
  qr_code: boolean
  lampiran: string | null
  template: string | null
}

const emptyForm = {
  nama: "", url_surat: "", kode_surat: "", jenis: "2",
  mandiri: false, favorit: false, kunci: false, qr_code: false,
  lampiran: "", template: "",
}

export default function SuratMasterManager({ data }: { data: Surat[] }) {
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
      if (editing) await updateSurat(editing, form)
      else await createSurat(form)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} data?`)) return
    try { await deleteSurat(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const openEdit = (item: any) => {
    setForm({
      nama: item.nama, url_surat: item.url_surat,
      kode_surat: item.kode_surat ?? "",
      jenis: String(item.jenis ?? "2"),
      mandiri: !!item.mandiri, favorit: !!item.favorit,
      kunci: !!item.kunci, qr_code: !!item.qr_code,
      lampiran: item.lampiran ?? "", template: item.template ?? "",
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <ContentHeader title="Pengaturan Surat" subtitle="Daftar Jenis Surat" breadcrumb={[{ label: "Sekretariat" }, { label: "Pengaturan Surat" }]} />

      <Box title={`Jenis Surat (${items.length})`} noPadding>
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

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>Kode</Th><Th>Nama Surat</Th><Th>Jenis</Th><Th>Layanan Mandiri</Th><Th>Favorit</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (<tr><Td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : items.map((s) => (
            <tr key={s.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(s.id)} onChange={() => toggleSelect(s.id)} /></Td>
              <Td className="font-mono">{s.kode_surat ?? "-"}</Td>
              <Td className="font-medium">{s.nama}</Td>
              <Td>{jenisLabel[s.jenis] ?? s.jenis}</Td>
              <Td><StatusLabel ok={!!s.mandiri} yes="Ya" no="Tidak" /></Td>
              <Td>{s.favorit ? <i className="fa fa-star text-yellow-500" /> : <i className="fa fa-star-o text-gray-300" />}</Td>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Jenis Surat</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nama <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL Surat <span className="text-red-500">*</span></label>
                    <input type="text" value={form.url_surat} onChange={(e) => setForm({ ...form, url_surat: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kode Surat</label>
                    <input type="text" value={form.kode_surat} onChange={(e) => setForm({ ...form, kode_surat: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Jenis</label>
                    <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                      <option value="1">Sistem</option>
                      <option value="2">Desa</option>
                      <option value="3">Disabled</option>
                      <option value="4">RTF Sistem</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lampiran</label>
                    <input type="text" value={form.lampiran} onChange={(e) => setForm({ ...form, lampiran: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Template</label>
                    <input type="text" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.mandiri} onChange={(e) => setForm({ ...form, mandiri: e.target.checked })} />
                    Layanan Mandiri
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.favorit} onChange={(e) => setForm({ ...form, favorit: e.target.checked })} />
                    Favorit
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.kunci} onChange={(e) => setForm({ ...form, kunci: e.target.checked })} />
                    Kunci
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.qr_code} onChange={(e) => setForm({ ...form, qr_code: e.target.checked })} />
                    QR Code
                  </label>
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
