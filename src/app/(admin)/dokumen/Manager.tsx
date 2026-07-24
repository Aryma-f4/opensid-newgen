"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Box, LteTable, Th, Td, Btn, StatusLabel, Paging } from "@/components/admin/Ui"
import { createDokumen, updateDokumen, deleteDokumen } from "./actions"

type Dokumen = {
  id: number
  nama: string
  tahun: number | null
  tgl_upload: Date
  lokasi_arsip: string | null
  enabled: number
  kategori: number
  tipe: number
  keterangan: string | null
}

const emptyForm = {
  nama: "", tahun: "", enabled: "1", kategori: "1", tipe: "1",
  lokasi_arsip: "", keterangan: "",
}

const kategoriOptions = [
  { value: "", label: "Semua Kategori" },
  { value: "1", label: "Identitas Penduduk" },
  { value: "2", label: "Keterangan" },
  { value: "3", label: "Lainnya" },
]

export default function DokumenManager({
  data, total, search, tahun, kategori, dusun, dusunList, pages, page,
}: {
  data: Dokumen[]
  total: number
  search?: string
  tahun?: string
  kategori?: string
  dusun?: string
  dusunList?: string[]
  pages?: number
  page?: number
}) {
  const [items, setItems] = useState(data)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedIds = Array.from(pendingIds)

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let submitData = { ...form }

      const fileInput = fileInputRef.current
      if (fileInput?.files?.[0]) {
        setUploading(true)
        const fd = new FormData()
        fd.append("file", fileInput.files[0])
        fd.append("subdir", "dokumen")
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (res.ok) {
          const result = await res.json()
          submitData.lokasi_arsip = result.path || result.url || ""
        }
        setUploading(false)
      }

      if (editing) await updateDokumen(editing, submitData)
      else await createDokumen(submitData)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} dokumen?`)) return
    try { await deleteDokumen(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const openEdit = (item: any) => {
    setForm({
      nama: item.nama, tahun: String(item.tahun ?? ""),
      enabled: String(item.enabled ?? "1"),
      kategori: String(item.kategori ?? "1"),
      tipe: String(item.tipe ?? "1"),
      lokasi_arsip: item.lokasi_arsip ?? "",
      keterangan: item.keterangan ?? "",
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <Box title={`Daftar Dokumen (${total.toLocaleString("id-ID")})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap gap-2 items-center">
          <form className="flex flex-wrap gap-2 flex-1" method="GET" action="">
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Cari nama dokumen..."
              className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs focus:border-lte-primary focus:outline-none"
            />
            <select name="tahun" defaultValue={tahun ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Tahun</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select name="kategori" defaultValue={kategori ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              {kategoriOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select name="dusun" defaultValue={dusun ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Dusun</option>
              {(dusunList ?? []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Btn type="submit" color="primary"><i className="fa fa-search" /> Cari</Btn>
            {(search || tahun || kategori || dusun) && (
              <a href="/dokumen" className="text-sm text-gray-500 hover:underline self-center">Reset</a>
            )}
          </form>
          <Btn color="success" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true) }}>
            <i className="fa fa-plus" /> Tambah Dokumen
          </Btn>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}><i className="fa fa-trash" /> Hapus</Btn>
          </div>
        )}

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>Nama Dokumen</Th><Th>Tahun</Th><Th>Tgl Upload</Th><Th>Lokasi Arsip</Th><Th>Status</Th><Th>Kategori</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (<tr><Td colSpan={8} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : items.map((d) => {
            const kategoriName = kategoriOptions.find((o) => o.value === String(d.kategori))?.label ?? d.kategori
            return (
              <tr key={d.id}>
                <Td className="text-center"><input type="checkbox" checked={pendingIds.has(d.id)} onChange={() => toggleSelect(d.id)} /></Td>
                <Td className="font-medium max-w-md truncate">{d.nama}</Td>
                <Td>{d.tahun ?? "-"}</Td>
                <Td>{new Date(d.tgl_upload).toLocaleDateString("id-ID")}</Td>
                <Td>{d.lokasi_arsip || "-"}</Td>
                <Td><StatusLabel ok={d.enabled === 1} /></Td>
                <Td>{kategoriName}</Td>
                <Td className="whitespace-nowrap">
                  <Link href={`/dokumen/${d.id}`}><Btn color="info" size="xs"><i className="fa fa-eye" /> Detail</Btn></Link>{" "}
                  <Btn color="primary" size="xs" onClick={() => openEdit(d)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                  <Btn color="danger" size="xs" onClick={() => handleDelete([d.id])}><i className="fa fa-trash" /> Hapus</Btn>
                </Td>
              </tr>
            )
          })}
        </LteTable>
      </Box>

      {pages && pages > 1 && (
        <Paging base="/dokumen" page={page ?? 1} pages={pages} q={search}
          extraParams={{ tahun: tahun || undefined, kategori: kategori || undefined, dusun: dusun || undefined }}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Dokumen</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nama Dokumen <span className="text-red-500">*</span></label>
                  <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tahun</label>
                    <input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                    <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                      <option value="1">Identitas Penduduk</option>
                      <option value="2">Keterangan</option>
                      <option value="3">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipe</label>
                    <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                      <option value="1">Surat</option>
                      <option value="2">Laporan</option>
                      <option value="3">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Upload File</label>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" className="w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lokasi Arsip (manual)</label>
                  <input type="text" value={form.lokasi_arsip} onChange={(e) => setForm({ ...form, lokasi_arsip: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Keterangan</label>
                  <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" rows={3} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <Btn type="button" color="default" onClick={() => setShowForm(false)}>Batal</Btn>
                <Btn type="submit" color="success" disabled={saving || uploading}>{uploading ? "Mengupload..." : saving ? "Menyimpan..." : "Simpan"}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
