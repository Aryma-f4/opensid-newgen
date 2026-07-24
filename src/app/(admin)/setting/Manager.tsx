"use client"

import { useState } from "react"
import { updateSetting } from "./actions"

type SettingItem = {
  id: number
  judul: string | null
  key: string | null
  value: string | null
  kategori: string | null
  jenis: string | null
  keterangan: string | null
  option: string | null
}

export default function SettingManager({ settings }: { settings: SettingItem[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSave(id: number) {
    setSaving(true)
    setMessage(null)
    try {
      const result = await updateSetting(id, editValue)
      if (result.success) {
        setMessage({ type: "success", text: "Berhasil disimpan" })
        setEditingId(null)
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Gagal menyimpan" })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  function startEdit(item: SettingItem) {
    setEditingId(item.id)
    setEditValue(item.value ?? "")
  }

  const grouped = groupBy(settings, (s) => s.kategori ?? "Umum")

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {Object.entries(grouped).map(([kategori, items]) => (
        <div key={kategori} className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-sm uppercase text-gray-600">{kategori}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 w-1/3">Judul</th>
                <th className="p-3 w-1/4">Key</th>
                <th className="p-3 w-1/3">Value</th>
                <th className="p-3 w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-medium">{item.judul}</span>
                    {item.keterangan && <p className="text-xs text-gray-400 mt-0.5">{item.keterangan}</p>}
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{item.key}</td>
                  <td className="p-3">
                    {editingId === item.id ? (
                      <div className="flex gap-2 items-center">
                        {item.jenis === "textarea" ? (
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm min-h-[60px]"
                            rows={3}
                          />
                        ) : (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        )}
                        <button onClick={() => handleSave(item.id)} disabled={saving} className="btn btn-primary btn-xs whitespace-nowrap">
                          {saving ? "..." : "Simpan"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn btn-default btn-xs whitespace-nowrap">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <span className="max-w-xs truncate block">{item.value ?? "-"}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingId !== item.id && (
                      <button onClick={() => startEdit(item)} className="btn btn-primary btn-xs">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  arr.forEach((item) => {
    const key = fn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  })
  return result
}
