"use client"

import { useState } from "react"
import Link from "next/link"
import { Box, LteTable, Th, Td, Btn, ContentHeader, Paging, StatusLabel } from "@/components/admin/Ui"
import { createRtm, updateRtm, deleteRtm } from "./actions"

type RtmItem = {
  id: number
  no_kk: string
  nik_kepala: number | null
  tgl_daftar: Date
  kelas_sosial: number | null
  terdaftar_dtks: boolean
  kepala: string | null
  nik: string | null
  kepalaId: number | null
  anggotaCount: number
}

const emptyForm = { no_kk: "", nik_kepala: "", kelas_sosial: "", terdaftar_dtks: false }

export default function RtmManager({
  data,
  total, page, pages, q,
  sejahteraRef,
  pendudukRef,
}: {
  data: RtmItem[]
  total: number
  page: number
  pages: number
  q: string
  sejahteraRef: { id: number; nama: string | null }[]
  pendudukRef: { id: number; nama: string; nik: string }[]
}) {
  const [items, setItems] = useState(data)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const selectedIds = Array.from(pendingIds)

  const sejahteraMap = new Map(sejahteraRef.map((s) => [s.id, s.nama]))

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await updateRtm(editing, form)
      else await createRtm(form)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} data?`)) return
    try { await deleteRtm(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const openEdit = (item: any) => {
    setForm({
      no_kk: item.no_kk,
      nik_kepala: String(item.nik_kepala ?? ""),
      kelas_sosial: String(item.kelas_sosial ?? ""),
      terdaftar_dtks: !!item.terdaftar_dtks,
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <ContentHeader title="Rumah Tangga" subtitle="Daftar Rumah Tangga" breadcrumb={[{ label: "Kependudukan" }, { label: "Rumah Tangga" }]} />

      <Box title={`Daftar Rumah Tangga (${total.toLocaleString("id-ID")})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap gap-2 items-center">
          <form className="flex gap-2 flex-1" method="GET" action="">
            <input name="q" defaultValue={q} placeholder="Cari nomor atau nama kepala..." className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs focus:border-lte-primary focus:outline-none" />
            <Btn type="submit" color="primary"><i className="fa fa-search" /> Cari</Btn>
            {q && <Link href="/rtm" className="text-gray-500 self-center text-sm hover:underline">Reset</Link>}
          </form>
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

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>No. Rumah Tangga</Th><Th>Kepala</Th><Th>NIK</Th><Th>Jml Anggota</Th><Th>Kelas Sosial</Th><Th>DTKS</Th><Th>Tgl Daftar</Th><Th>Aksi</Th></>}>
          {items.map((r) => (
            <tr key={r.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(r.id)} onChange={() => toggleSelect(r.id)} /></Td>
              <Td className="font-mono">{r.no_kk}</Td>
              <Td>{r.kepala ? <Link href={`/penduduk/${r.kepalaId}`} className="text-lte-primary hover:underline">{r.kepala}</Link> : "-"}</Td>
              <Td className="font-mono">{r.nik ?? "-"}</Td>
              <Td className="text-center">{r.anggotaCount}</Td>
              <Td>{sejahteraMap.get(r.kelas_sosial ?? 0) ?? "-"}</Td>
              <Td><StatusLabel ok={r.terdaftar_dtks} yes="Ya" no="Tidak" /></Td>
              <Td>{new Date(r.tgl_daftar).toLocaleDateString("id-ID")}</Td>
              <Td className="whitespace-nowrap">
                <Btn color="primary" size="xs" onClick={() => openEdit(r)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([r.id])}><i className="fa fa-trash" /> Hapus</Btn>
              </Td>
            </tr>
          ))}
          {items.length === 0 && (<tr><Td colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>)}
        </LteTable>
      </Box>

      <Paging base="/rtm" page={page} pages={pages} q={q} />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Rumah Tangga</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">No. Rumah Tangga <span className="text-red-500">*</span></label>
                  <input type="text" value={form.no_kk} onChange={(e) => setForm({ ...form, no_kk: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kepala Rumah Tangga</label>
                  <select value={form.nik_kepala} onChange={(e) => setForm({ ...form, nik_kepala: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="">-- Pilih --</option>
                    {pendudukRef.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama} ({p.nik})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kelas Sosial</label>
                  <select value={form.kelas_sosial} onChange={(e) => setForm({ ...form, kelas_sosial: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="">-- Pilih --</option>
                    {sejahteraRef.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.terdaftar_dtks} onChange={(e) => setForm({ ...form, terdaftar_dtks: e.target.checked })} />
                  Terdaftar DTKS
                </label>
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
