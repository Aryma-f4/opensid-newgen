"use client"

import { useState } from "react"
import { Box, LteTable, Th, Td, Btn, StatusLabel } from "@/components/admin/Ui"

export default function WidgetManager({ widgets, regions }: { widgets: any[]; regions: any[] }) {
  const [items, setItems] = useState(widgets)
  const [dragId, setDragId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ title: "", content: "" })
  const [toast, setToast] = useState<string | null>(null)

  const regionNames = regions.length > 0 ? regions.map((r) => r.name) : ["sidebar", "header", "footer"]

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(null), 2500) }

  function handleDragStart(id: number) { setDragId(id) }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  function handleDrop(region: string) {
    if (dragId === null) return
    const updated = items.map((w) => w.id === dragId ? { ...w, region } : w)
    setItems(updated)
    setDragId(null)
    fetch(`/api/theme/widgets/${dragId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ region }) }).catch(() => {})
    showToast("Widget dipindahkan")
  }

  async function startEdit(w: any) {
    setEditId(w.id)
    setEditForm({ title: w.title || "", content: w.content || "" })
  }

  async function saveEdit() {
    if (editId === null) return
    try {
      await fetch(`/api/theme/widgets/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) })
      setItems(items.map((w) => w.id === editId ? { ...w, ...editForm } : w))
      setEditId(null)
      showToast("Widget diperbarui")
    } catch { showToast("Gagal menyimpan") }
  }

  async function toggleActive(id: number, current: boolean) {
    await fetch(`/api/theme/widgets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: current ? 0 : 1 }) })
    setItems(items.map((w) => w.id === id ? { ...w, is_active: current ? 0 : 1 } : w))
  }

  async function deleteWidget(id: number) {
    if (!confirm("Hapus widget ini?")) return
    await fetch(`/api/theme/widgets/${id}`, { method: "DELETE" })
    setItems(items.filter((w) => w.id !== id))
    showToast("Widget dihapus")
  }

  return (
    <div>
      {/* Region drag-drop areas */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", marginBottom: 20 }}>
        {regionNames.map((region) => {
          const regionWidgets = items.filter((w) => w.region === region)
          return (
            <div key={region} onDragOver={handleDragOver} onDrop={() => handleDrop(region)}
              style={{ padding: 12, borderRadius: 10, border: "2px dashed #d0d5dd", background: "#f9fafb", minHeight: 100 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#344054", marginBottom: 8, textTransform: "capitalize" }}>{region}</div>
              {regionWidgets.map((w) => (
                <div key={w.id} draggable onDragStart={() => handleDragStart(w.id)}
                  style={{ padding: "8px 12px", marginBottom: 6, borderRadius: 6, background: "#fff", border: "1px solid #e5e7eb", cursor: "grab", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span><strong>{w.name || w.widget_key}</strong> <span style={{ color: "#9ca3af", fontSize: 11 }}>({w.type})</span></span>
                  <span style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => startEdit(w)} className="btn btn-xs btn-default" style={{ padding: "2px 6px", fontSize: 10 }}>Edit</button>
                    <button onClick={() => toggleActive(w.id, w.is_active)} className="btn btn-xs btn-default" style={{ padding: "2px 6px", fontSize: 10 }}>{w.is_active ? "Nonaktif" : "Aktif"}</button>
                    <button onClick={() => deleteWidget(w.id)} className="btn btn-xs btn-danger" style={{ padding: "2px 6px", fontSize: 10 }}>Hapus</button>
                  </span>
                </div>
              ))}
              {regionWidgets.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: 16 }}>Seret widget ke sini</div>}
            </div>
          )
        })}
      </div>

      {/* Widget table */}
      <Box title={`Widget (${items.length})`} noPadding>
        <LteTable head={<><Th>Nama</Th><Th>Key</Th><Th>Tipe</Th><Th>Region</Th><Th>Urutan</Th><Th>Status</Th><Th>Aksi</Th></>}>
          {items.length === 0 ? (<tr><Td colSpan={7} className="text-center py-8 text-gray-400">Belum ada widget</Td></tr>) : items.map((w: any) => (
            <tr key={w.id}><Td>{w.name}</Td><Td className="font-mono text-xs">{w.widget_key}</Td><Td>{w.type}</Td><Td>{w.region}</Td><Td>{w.sort_order}</Td><Td><StatusLabel ok={w.is_active} /></Td>
              <Td>
                <button onClick={() => startEdit(w)} className="btn btn-xs btn-primary" style={{ marginRight: 4 }}>Edit</button>
                <button onClick={() => deleteWidget(w.id)} className="btn btn-xs btn-danger">Hapus</button>
              </Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      {/* Edit modal */}
      {editId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1050, display: "flex", justifyContent: "center", paddingTop: 80 }} onClick={() => setEditId(null)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 480, maxHeight: "60vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Edit Widget</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Judul</label>
              <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Konten</label>
              <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={6} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, fontFamily: "monospace" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditId(null)} className="btn btn-default btn-sm">Batal</button>
              <button onClick={saveEdit} className="btn btn-primary btn-sm">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, padding: "12px 24px", borderRadius: 10, background: "#059669", color: "#fff", fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,.15)" }}>{toast}</div>}
    </div>
  )
}