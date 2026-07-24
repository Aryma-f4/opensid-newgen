"use client"

import { useState } from "react"
import { updateProfil } from "./actions"

type UserData = {
  id: number
  username: string | null
  nama: string | null
  email: string | null
  phone: string | null
  foto: string | null
  grup: string | null
  last_login: string | null
}

export default function PenggunaManager({ user }: { user: UserData }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [form, setForm] = useState({
    nama: user.nama ?? "",
    email: user.email ?? "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const result = await updateProfil({
        nama: form.nama,
        email: form.email,
      })
      if (result.success) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui" })
        setEditing(false)
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Gagal menyimpan" })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (!editing) {
    return (
      <div>
        {message && (
          <div className={`p-3 rounded text-sm mb-4 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <div className="p-6 flex items-center gap-4 border-b">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold overflow-hidden">
            {user.foto && user.foto !== "kuser.png" ? (
              <img src={`/storage/user_pict/${user.foto}`} alt="" className="w-full h-full object-cover" />
            ) : (
              user.nama?.[0] ?? "U"
            )}
          </div>
          <div>
            <div className="text-lg font-semibold">{user.nama ?? user.username}</div>
            <div className="text-sm text-gray-500">{user.grup ?? ""}</div>
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody>
            {[
              ["Username", user.username],
              ["Nama", user.nama],
              ["Email", user.email],
              ["Telepon", user.phone],
              ["Grup", user.grup],
              ["Login Terakhir", user.last_login],
            ].map(([label, value]) => (
              <tr key={label as string} className="border-t">
                <td className="p-3 w-40 text-gray-500">{label as string}</td>
                <td className="p-3">{value ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-3 border-t">
          <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">
            <i className="fa fa-edit" /> Edit Profil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {message && (
        <div className={`p-3 rounded text-sm mb-4 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input type="text" value={user.username ?? ""} className="form-control bg-gray-50" disabled />
          <p className="text-xs text-gray-400 mt-1">Username tidak dapat diubah</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="form-control"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-default">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
