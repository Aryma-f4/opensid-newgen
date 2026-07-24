"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn, StatusLabel } from "@/components/admin/Ui"

type Menu = {
  id: number
  nama: string
  link: string
  parrent: number | null
  enabled: boolean | null
  urut: number | null
  depth: number
}

export default function MenuManager({ initial }: { initial: Menu[] }) {
  const router = useRouter()
  const [list, setList] = useState(initial)
  const [editing, setEditing] = useState<number | null>(null)
  const [addParent, setAddParent] = useState<number>(0)
  const [form, setForm] = useState({ nama: "", link: "", urut: 0 })
  const [saving, setSaving] = useState(false)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parrent: addParent, config_id: 1 }),
      })
      setForm({ nama: "", link: "", urut: 0 })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function save(id: number) {
    const menu = list.find((item) => item.id === id)
    if (!menu) return
    setSaving(true)
    try {
      await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: menu.nama,
          link: menu.link,
          urut: menu.urut ?? 0,
          enabled: menu.enabled ?? true,
          parrent: menu.parrent ?? 0,
        }),
      })
      setEditing(null)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function del(id: number) {
    if (!confirm("Hapus menu ini?")) return
    await fetch(`/api/menu/${id}`, { method: "DELETE" })
    setEditing(null)
    router.refresh()
  }

  function update(id: number, patch: Partial<Menu>) {
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div>
      <ContentHeader title="Menu" breadcrumb={[{ label: "Web" }, { label: "Menu" }]} />

      <Box title="Tambah Menu" noPadding>
        <form onSubmit={add} className="p-3 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Parent</label>
            <select
              value={addParent}
              onChange={(e) => setAddParent(parseInt(e.target.value))}
              className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm"
            >
              <option value={0}>Root</option>
              {list.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {"  ".repeat(menu.depth)}
                  {menu.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-44">
            <label className="block text-xs text-gray-500 mb-1">Nama</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm w-full"
              required
            />
          </div>
          <div className="min-w-64 flex-1">
            <label className="block text-xs text-gray-500 mb-1">Link</label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm w-full font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Urut</label>
            <input
              type="number"
              value={form.urut}
              onChange={(e) => setForm({ ...form, urut: parseInt(e.target.value) || 0 })}
              className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm w-24"
            />
          </div>
          <Btn type="submit" color="primary" disabled={saving}>
            <i className="fa fa-plus" />
            Tambah
          </Btn>
        </form>
      </Box>

      <Box title={`Daftar Menu (${list.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Nama</Th>
              <Th>Link</Th>
              <Th>Status</Th>
              <Th>Urut</Th>
              <Th>Aksi</Th>
            </>
          }
        >
          {list.map((menu) => {
            const isEditing = editing === menu.id
            return (
              <tr key={menu.id}>
                <Td>
                  <div style={{ paddingLeft: `${0.75 + menu.depth * 1.5}rem` }}>
                    {isEditing ? (
                      <input
                        value={menu.nama}
                        onChange={(e) => update(menu.id, { nama: e.target.value })}
                        className="border border-[#d2d6de] rounded-[3px] px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      menu.nama
                    )}
                  </div>
                </Td>
                <Td className="font-mono text-xs">
                  {isEditing ? (
                    <input
                      value={menu.link}
                      onChange={(e) => update(menu.id, { link: e.target.value })}
                      className="border border-[#d2d6de] rounded-[3px] px-2 py-1 text-sm w-full font-mono"
                    />
                  ) : (
                    menu.link
                  )}
                </Td>
                <Td>
                  {isEditing ? (
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={menu.enabled ?? true}
                        onChange={(e) => update(menu.id, { enabled: e.target.checked })}
                      />
                      Aktif
                    </label>
                  ) : (
                    <StatusLabel ok={!!menu.enabled} />
                  )}
                </Td>
                <Td className="w-24">
                  {isEditing ? (
                    <input
                      type="number"
                      value={menu.urut ?? 0}
                      onChange={(e) => update(menu.id, { urut: parseInt(e.target.value) || 0 })}
                      className="border border-[#d2d6de] rounded-[3px] px-2 py-1 text-sm w-20"
                    />
                  ) : (
                    menu.urut ?? 0
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  {isEditing ? (
                    <>
                      <Btn color="success" size="xs" onClick={() => save(menu.id)} disabled={saving}>
                        <i className="fa fa-save" /> Simpan
                      </Btn>
                      <Btn color="default" size="xs" onClick={() => setEditing(null)} className="ml-2">
                        Batal
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn color="primary" size="xs" onClick={() => setEditing(menu.id)}>
                        <i className="fa fa-pencil" /> Edit
                      </Btn>
                      <Btn color="danger" size="xs" onClick={() => del(menu.id)} className="ml-2">
                        <i className="fa fa-trash" /> Hapus
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
