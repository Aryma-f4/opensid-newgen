"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { addKategori, updateKategori, deleteKategoris, toggleKategori } from "./actions"
import { ContentHeader, Box, LteTable, Th, Td, Btn, StatusLabel } from "@/components/admin/Ui"

type Kategori = {
  id: number
  kategori: string
  slug: string | null
  urut: number
  enabled: number
  _count: { artikel: number }
  subCount: number
}

export default function KategoriManager({ initial, parentId, parentName }: { initial: Kategori[]; parentId: number; parentName: string }) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editForm, setEditForm] = useState<Partial<Kategori>>({})
  const [addForm, setAddForm] = useState({ kategori: "", slug: "", urut: 0 })
  const [saving, setSaving] = useState(false)

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === initial.length ? [] : initial.map((item) => item.id)))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addKategori({ ...addForm, parrent: parentId, enabled: 1 })
      setAddForm({ kategori: "", slug: "", urut: 0 })
    } catch (error: any) {
      alert(error.message || "Gagal menambahkan kategori")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async (id: number) => {
    setSaving(true)
    try {
      await updateKategori(id, {
        kategori: editForm.kategori ?? "",
        slug: editForm.slug ?? "",
        urut: editForm.urut ?? 0,
        enabled: editForm.enabled ?? 1,
        parrent: parentId,
      })
      setEditingId(null)
    } catch (error: any) {
      alert(error.message || "Gagal menyimpan perubahan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} kategori yang dipilih?`)) return
    startTransition(async () => {
      try {
        await deleteKategoris(ids)
        setSelectedIds([])
      } catch (error: any) {
        alert(error.message || "Gagal menghapus kategori")
      }
    })
  }

  const handleToggle = (id: number, current: number) => {
    startTransition(async () => {
      try {
        await toggleKategori(id, current)
      } catch {
        alert("Gagal merubah status")
      }
    })
  }

  return (
    <div>
      <ContentHeader title="Kategori" breadcrumb={[{ label: "Web" }, { label: "Kategori" }]} />

      <Box title="Navigasi" noPadding>
        <div className="p-3 text-sm">
          <Link href="/kategori?parent=0" className="text-lte-primary hover:underline">Kategori Utama</Link>
          {parentId > 0 && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="font-semibold text-gray-700">{parentName}</span>
            </>
          )}
        </div>
      </Box>

      <Box title="Tambah Kategori" noPadding>
        <form onSubmit={handleAdd} className="p-3 flex flex-wrap gap-3 items-end">
          <div className="min-w-56 flex-1">
            <label className="block text-xs text-gray-500 mb-1">Nama Kategori</label>
            <input
              type="text"
              value={addForm.kategori}
              onChange={(e) => setAddForm({ ...addForm, kategori: e.target.value })}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
              required
            />
          </div>
          <div className="min-w-48 flex-1">
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <input
              type="text"
              value={addForm.slug}
              onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Urut</label>
            <input
              type="number"
              value={addForm.urut}
              onChange={(e) => setAddForm({ ...addForm, urut: parseInt(e.target.value) || 0 })}
              className="w-24 border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            />
          </div>
          <Btn type="submit" color="primary" disabled={saving}>
            <i className="fa fa-plus" />
            Tambah
          </Btn>
        </form>
      </Box>

      {selectedIds.length > 0 && (
        <div className="mb-3">
          <Btn color="danger" onClick={() => handleDelete(selectedIds)}>
            <i className="fa fa-trash" />
            Hapus Terpilih ({selectedIds.length})
          </Btn>
        </div>
      )}

      <Box title={`Daftar Kategori (${initial.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th className="w-10 text-center">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-lte-primary">
                  {selectedIds.length === initial.length && initial.length > 0 ? <i className="fa fa-check-square-o text-lg" /> : <i className="fa fa-square-o text-lg" />}
                </button>
              </Th>
              <Th>Kategori</Th>
              <Th>Status</Th>
              <Th className="text-center">Urut</Th>
              <Th className="text-center">Sub</Th>
              <Th className="text-center">Artikel</Th>
              <Th className="text-right">Aksi</Th>
            </>
          }
        >
          {initial.map((kategori) => {
            const isEditing = editingId === kategori.id
            const isSelected = selectedIds.includes(kategori.id)
            return (
              <tr key={kategori.id} className={isPending ? "opacity-60" : ""}>
                <Td className="text-center">
                  <button onClick={() => toggleSelect(kategori.id)} className={isSelected ? "text-lte-primary" : "text-gray-300"}>
                    {isSelected ? <i className="fa fa-check-square-o text-lg" /> : <i className="fa fa-square-o text-lg" />}
                  </button>
                </Td>
                <Td>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.kategori ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
                        className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
                      />
                      <input
                        value={editForm.slug ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-[#222]">{kategori.kategori}</div>
                      <div className="text-xs text-gray-500 font-mono">{kategori.slug}</div>
                    </div>
                  )}
                </Td>
                <Td>
                  {isEditing ? (
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(editForm.enabled ?? kategori.enabled) === 1}
                        onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked ? 1 : 0 })}
                      />
                      Aktif
                    </label>
                  ) : (
                    <StatusLabel ok={kategori.enabled === 1} />
                  )}
                </Td>
                <Td className="text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.urut ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, urut: parseInt(e.target.value) || 0 })}
                      className="w-20 border border-[#d2d6de] rounded-[3px] px-2 py-1 text-sm text-center"
                    />
                  ) : (
                    kategori.urut
                  )}
                </Td>
                <Td className="text-center">
                  {parentId === 0 ? (
                    <Link href={`/kategori?parent=${kategori.id}`} className="text-lte-primary hover:underline">
                      {kategori.subCount}
                    </Link>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td className="text-center">{kategori._count.artikel}</Td>
                <Td className="text-right whitespace-nowrap">
                  {isEditing ? (
                    <>
                      <Btn color="success" size="xs" onClick={() => handleSaveEdit(kategori.id)} disabled={saving}>
                        <i className="fa fa-save" />
                        Simpan
                      </Btn>
                      <Btn color="default" size="xs" onClick={() => setEditingId(null)} className="ml-2">
                        Batal
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn
                        color="primary"
                        size="xs"
                        onClick={() => {
                          setEditingId(kategori.id)
                          setEditForm({ kategori: kategori.kategori, slug: kategori.slug ?? "", urut: kategori.urut, enabled: kategori.enabled })
                        }}
                      >
                        <i className="fa fa-pencil" />
                        Edit
                      </Btn>
                      <Btn
                        color="danger"
                        size="xs"
                        onClick={() => handleDelete([kategori.id])}
                        disabled={isPending || kategori._count.artikel > 0 || kategori.subCount > 0}
                        className="ml-2"
                      >
                        <i className="fa fa-trash" />
                        Hapus
                      </Btn>
                    </>
                  )}
                </Td>
              </tr>
            )
          })}
        </LteTable>
      </Box>
    </div>
  )
}
