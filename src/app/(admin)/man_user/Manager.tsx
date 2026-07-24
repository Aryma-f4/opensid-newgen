"use client"

import { useState } from "react"
import { Box, LteTable, Th, Td, Btn, ContentHeader, StatusLabel } from "@/components/admin/Ui"
import { createUser, updateUser, deleteUser } from "./actions"

type UserItem = {
  id: number
  username: string | null
  nama: string | null
  email: string | null
  id_grup: number | null
  active: number | null
  last_login: Date | null
  grup: string | null
}

const emptyForm = { username: "", nama: "", email: "", id_grup: "", active: "1", password: "" }

export default function ManUserManager({
  data,
  grupRef,
}: {
  data: UserItem[]
  grupRef: { id: number; nama: string }[]
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
      if (editing) await updateUser(editing, form)
      else await createUser(form)
      setShowForm(false); setEditing(null); setForm(emptyForm)
    } catch (err: any) { alert(err.message || "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} pengguna?`)) return
    try { await deleteUser(ids); setPendingIds(new Set()) }
    catch (err: any) { alert(err.message || "Gagal menghapus") }
  }

  const openEdit = (item: any) => {
    setForm({
      username: item.username ?? "",
      nama: item.nama ?? "",
      email: item.email ?? "",
      id_grup: String(item.id_grup ?? ""),
      active: String(item.active ?? "1"),
      password: "",
    })
    setEditing(item.id); setShowForm(true)
  }

  return (
    <div>
      <ContentHeader title="Pengguna" subtitle="Manajemen Pengguna" breadcrumb={[{ label: "Pengaturan" }, { label: "Pengguna" }]} />

      <Box title={`Daftar Pengguna (${items.length})`} noPadding>
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

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(items.map(p => p.id))) }} /></Th><Th>Username</Th><Th>Nama</Th><Th>Email</Th><Th>Grup</Th><Th>Status</Th><Th>Login Terakhir</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (<tr><Td colSpan={8} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : items.map((u) => (
            <tr key={u.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(u.id)} onChange={() => toggleSelect(u.id)} /></Td>
              <Td className="font-medium">{u.username ?? "-"}</Td>
              <Td>{u.nama ?? "-"}</Td>
              <Td>{u.email ?? "-"}</Td>
              <Td>{u.grup ?? "-"}</Td>
              <Td><StatusLabel ok={!!u.active} yes="Aktif" no="Tidak Aktif" /></Td>
              <Td>{u.last_login?.toLocaleString("id-ID") ?? "-"}</Td>
              <Td className="whitespace-nowrap">
                <Btn color="primary" size="xs" onClick={() => openEdit(u)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([u.id])}><i className="fa fa-trash" /> Hapus</Btn>
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
                <h2 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Pengguna</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Username <span className="text-red-500">*</span></label>
                    <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nama <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grup</label>
                    <select value={form.id_grup} onChange={(e) => setForm({ ...form, id_grup: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                      <option value="">-- Pilih --</option>
                      {grupRef.map((g) => (
                        <option key={g.id} value={g.id}>{g.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Password {editing ? "(kosongkan jika tidak diubah)" : ""} <span className="text-red-500">*</span>
                  </label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm">
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
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
