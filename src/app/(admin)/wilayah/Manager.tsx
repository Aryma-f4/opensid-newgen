"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Box, LteTable, Th, Td, Btn, ContentHeader, SmallBox } from "@/components/admin/Ui"
import { createWilayah, updateWilayah, deleteWilayah } from "./actions"

type Cluster = {
  id: number
  dusun: string
  rw: string
  rt: string
  id_kepala: number | null
  dusun_rw_rt: string
  kepala: string | null
}

const emptyForm = { dusun: "-", rw: "0", rt: "0", id_kepala: "" }

export default function WilayahManager({
  data,
  pendudukRef,
  dusunCount,
  rwCount,
  rtCount,
}: {
  data: Cluster[]
  pendudukRef: { id: number; nama: string }[]
  dusunCount: number
  rwCount: number
  rtCount: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState(data)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const selectedIds = Array.from(pendingIds)

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateWilayah(editing, form)
      } else {
        await createWilayah(form)
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} wilayah?`)) return
    try {
      await deleteWilayah(ids)
      setPendingIds(new Set())
    } catch (err: any) {
      alert(err.message || "Gagal menghapus")
    }
  }

  const openEdit = (item: any) => {
    setForm({
      dusun: item.dusun,
      rw: item.rw ?? "0",
      rt: item.rt ?? "0",
      id_kepala: String(item.id_kepala ?? ""),
    })
    setEditing(item.id)
    setShowForm(true)
  }

  return (
    <div>
      <ContentHeader title="Wilayah Administratif" breadcrumb={[{ label: "Kependudukan" }, { label: "Wilayah" }]} />

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <SmallBox value={dusunCount} label="Dusun" icon="fa-map-marker" color="green" />
        <SmallBox value={rwCount} label="RW" icon="fa-sitemap" color="yellow" />
        <SmallBox value={rtCount} label="RT" icon="fa-users" color="blue" />
      </div>

      <Box title={`Daftar Wilayah (${items.length})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap gap-2 items-center">
          <Btn color="success" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true) }}>
            <i className="fa fa-plus" /> Tambah Wilayah
          </Btn>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}>
              <i className="fa fa-trash" /> Hapus
            </Btn>
          </div>
        )}

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>Dusun</Th><Th>RW</Th><Th>RT</Th><Th>Kepala Wilayah</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (
            <tr><Td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>
          ) : items.map((c) => (
            <tr key={c.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(c.id)} onChange={() => toggleSelect(c.id)} /></Td>
              <Td>{c.dusun}</Td>
              <Td>{c.rw !== "0" ? c.rw : "-"}</Td>
              <Td>{c.rt !== "0" ? c.rt : "-"}</Td>
              <Td>{c.kepala ?? "-"}</Td>
              <Td className="whitespace-nowrap">
                <Link href={`/wilayah/${c.id}`}><Btn color="info" size="xs"><i className="fa fa-eye" /> Detail</Btn></Link>{" "}
                <Btn color="primary" size="xs" onClick={() => openEdit(c)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([c.id])}><i className="fa fa-trash" /> Hapus</Btn>
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
                <h2 className="text-lg font-bold">{editing ? "Edit Wilayah" : "Tambah Wilayah"}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dusun <span className="text-red-500">*</span></label>
                  <input type="text" value={form.dusun} onChange={(e) => setForm({ ...form, dusun: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">RW</label>
                    <input type="text" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">RT</label>
                    <input type="text" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kepala Wilayah</label>
                  <select value={form.id_kepala} onChange={(e) => setForm({ ...form, id_kepala: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="">-- Pilih --</option>
                    {pendudukRef.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
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
