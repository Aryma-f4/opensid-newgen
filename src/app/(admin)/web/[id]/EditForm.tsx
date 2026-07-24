"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Btn, ContentHeader } from "@/components/admin/Ui"

type Props = {
  artikel: {
    id: number
    judul: string
    isi: string
    id_kategori: number | null
    enabled: number
    headline: boolean
    slider: boolean
    tipe: string
  }
  kategori: { id: number; kategori: string }[]
}

export default function EditArtikelForm({ artikel, kategori }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    judul: artikel.judul,
    isi: artikel.isi,
    id_kategori: artikel.id_kategori ?? "",
    enabled: artikel.enabled === 1,
    headline: artikel.headline,
    slider: artikel.slider,
    tipe: artikel.tipe,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch(`/api/artikel/${artikel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      router.push("/web")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus artikel ini?")) return
    setDeleting(true)
    try {
      await fetch(`/api/artikel/${artikel.id}`, { method: "DELETE" })
      router.push("/web")
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <ContentHeader title="Edit Artikel" breadcrumb={[{ label: "Web" }, { label: "Edit Artikel" }]} />
      <Box title="Form Artikel" noPadding>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-2 focus:outline-none focus:border-lte-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konten</label>
            <textarea
              value={form.isi}
              onChange={(e) => setForm({ ...form, isi: e.target.value })}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-2 h-64 font-mono text-sm focus:outline-none focus:border-lte-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              value={form.id_kategori}
              onChange={(e) => setForm({ ...form, id_kategori: e.target.value ? parseInt(e.target.value) : "" })}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-2 focus:outline-none focus:border-lte-primary"
            >
              <option value="">Tidak ada</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>{k.kategori}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-5 flex-wrap text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Aktif</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.checked })} /> Headline</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.slider} onChange={(e) => setForm({ ...form, slider: e.target.checked })} /> Slider</label>
          </div>
          <div className="flex gap-2">
            <Btn type="submit" color="primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
            <Btn type="button" color="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Menghapus..." : "Hapus"}</Btn>
          </div>
        </form>
      </Box>
    </div>
  )
}
