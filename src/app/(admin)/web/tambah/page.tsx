"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ContentHeader, Box, Btn } from "@/components/admin/Ui"

export default function TambahArtikel() {
  const router = useRouter()
  const [form, setForm] = useState({
    judul: "",
    isi: "",
    id_kategori: "",
    enabled: true,
    headline: false,
    slider: false,
    tipe: "dinamis",
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/artikel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push("/web")
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <ContentHeader title="Tambah Artikel" breadcrumb={[{ label: "Web" }, { label: "Tambah Artikel" }]} />
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
            <input
              type="number"
              value={form.id_kategori}
              onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-2 focus:outline-none focus:border-lte-primary"
              placeholder="ID Kategori"
            />
          </div>
          <div className="flex gap-5 flex-wrap text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Aktif</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.checked })} /> Headline</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.slider} onChange={(e) => setForm({ ...form, slider: e.target.checked })} /> Slider</label>
          </div>
          <Btn type="submit" color="primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
        </form>
      </Box>
    </div>
  )
}
