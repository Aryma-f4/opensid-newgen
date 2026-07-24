"use client"

import { useState } from "react"
import { updateIdentitasDesa } from "./actions"

type ConfigData = {
  nama_desa: string | null
  alamat_kantor: string | null
  nama_kecamatan: string | null
  nama_kabupaten: string | null
  email_desa: string | null
  telepon: string | null
  kode_pos: number | null
  website: string | null
  logo: string | null
}

export default function IdentitasDesaManager({ config }: { config: ConfigData | null }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [form, setForm] = useState({
    nama_desa: config?.nama_desa ?? "",
    alamat_kantor: config?.alamat_kantor ?? "",
    nama_kecamatan: config?.nama_kecamatan ?? "",
    nama_kabupaten: config?.nama_kabupaten ?? "",
    email_desa: config?.email_desa ?? "",
    telepon: config?.telepon ?? "",
    kode_pos: config?.kode_pos?.toString() ?? "",
    website: config?.website ?? "",
  })

  if (!config) {
    return <div className="p-4 text-gray-500">Belum ada data desa.</div>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const result = await updateIdentitasDesa({
        nama_desa: form.nama_desa,
        alamat_kantor: form.alamat_kantor,
        nama_kecamatan: form.nama_kecamatan,
        nama_kabupaten: form.nama_kabupaten,
        email_desa: form.email_desa,
        telepon: form.telepon,
        kode_pos: form.kode_pos ? parseInt(form.kode_pos) : null,
        website: form.website,
      })
      if (result.success) {
        setMessage({ type: "success", text: "Data desa berhasil diperbarui" })
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
        <div className="flex items-start gap-6 p-4">
          <div className="w-24 h-24 shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {config.logo ? (
              <img src={`/storage/desa/logo/${config.logo}`} alt="Logo desa" className="w-full h-full object-contain" />
            ) : (
              <i className="fa fa-institution text-4xl text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Nama Desa", config.nama_desa],
                  ["Alamat Kantor", config.alamat_kantor],
                  ["Kecamatan", config.nama_kecamatan],
                  ["Kabupaten", config.nama_kabupaten],
                  ["Email Desa", config.email_desa],
                  ["Telepon", config.telepon],
                  ["Kode Pos", config.kode_pos?.toString()],
                  ["Website", config.website],
                ].map(([label, value]) => (
                  <tr key={label as string} className="border-b border-[#f4f4f4] last:border-0">
                    <td className="py-2 pr-4 w-40 text-gray-500">{label as string}</td>
                    <td className="py-2 font-medium">{value ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">
                <i className="fa fa-edit" /> Edit
              </button>
            </div>
          </div>
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
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Desa</label>
            <input type="text" value={form.nama_desa} onChange={(e) => handleChange("nama_desa", e.target.value)} className="form-control" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Kantor</label>
            <input type="text" value={form.alamat_kantor} onChange={(e) => handleChange("alamat_kantor", e.target.value)} className="form-control" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kecamatan</label>
            <input type="text" value={form.nama_kecamatan} onChange={(e) => handleChange("nama_kecamatan", e.target.value)} className="form-control" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kabupaten</label>
            <input type="text" value={form.nama_kabupaten} onChange={(e) => handleChange("nama_kabupaten", e.target.value)} className="form-control" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Desa</label>
            <input type="email" value={form.email_desa} onChange={(e) => handleChange("email_desa", e.target.value)} className="form-control" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telepon</label>
            <input type="text" value={form.telepon} onChange={(e) => handleChange("telepon", e.target.value)} className="form-control" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kode Pos</label>
            <input type="number" value={form.kode_pos} onChange={(e) => handleChange("kode_pos", e.target.value)} className="form-control" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input type="text" value={form.website} onChange={(e) => handleChange("website", e.target.value)} className="form-control" />
          </div>
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
