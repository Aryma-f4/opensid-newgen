"use client"

import { useState, useEffect } from "react"

export type Field<T = any> = {
  name: keyof T & string
  label: string
  type?: "text" | "number" | "textarea" | "checkbox" | "select" | "date" | "url" | "email" | "password"
  options?: { value: string | number; label: string }[]
  placeholder?: string
  defaultValue?: any
  required?: boolean
  help?: string
}

type Props<T> = {
  title: string
  fields: Field<T>[]
  initial?: Partial<T>
  endpoint: string
  method?: "POST" | "PUT"
  onClose: () => void
  onSaved?: () => void
}

export default function FormModal<T extends Record<string, any>>({
  title,
  fields,
  initial = {},
  endpoint,
  method = "POST",
  onClose,
  onSaved,
}: Props<T>) {
  const [form, setForm] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {}
    for (const f of fields) {
      init[f.name] = initial[f.name as string] ?? f.defaultValue ?? (f.type === "checkbox" ? false : "")
    }
    return init
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const text = await res.text()
        try { setError(JSON.parse(text).error || text) } catch { setError(text) }
        return
      }
      onSaved?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><i className="fa fa-times" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</div>}
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={4}
                />
              ) : f.type === "select" ? (
                <select
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  required={f.required}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Pilih...</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === "checkbox" ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                  />
                  <span className="text-sm">{f.help ?? "Ya"}</span>
                </label>
              ) : (
                <input
                  type={f.type ?? "text"}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              )}
              {f.help && f.type !== "checkbox" && <p className="text-xs text-gray-500 mt-1">{f.help}</p>}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}