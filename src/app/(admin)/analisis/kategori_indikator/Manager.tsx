"use client"

import CrudManager from "@/components/admin/CrudManager"

type KategoriType = {
  id: number
  kategori: string
  kategori_kode: string | null
  id_master: number | null
  analisis_master: { nama: string } | null
  _count: { analisis_indikator: number }
}

const columns = [
  { key: "kategori", label: "Kategori", render: (r: KategoriType) => <span className="font-medium">{r.kategori}</span> },
  { key: "kategori_kode", label: "Kode" },
  { key: "id_master", label: "Master Survey", render: (r: KategoriType) => r.analisis_master?.nama ?? "-" },
  { key: "_count", label: "Jml Indikator", render: (r: KategoriType) => r._count.analisis_indikator },
]

const fields = [
  { name: "id_master" as const, label: "Master Survey", type: "select" as const, options: [] },
  { name: "kategori" as const, label: "Nama Kategori", type: "text" as const, required: true },
  { name: "kategori_kode" as const, label: "Kode Kategori", type: "text" as const },
]

export default function Manager({ initial }: { initial?: KategoriType[] }) {
  // Dynamically load master options
  const masterOptions = (() => {
    if (!initial) return []
    const ids = new Set<number>()
    const options: { value: number; label: string }[] = []
    for (const item of initial) {
      if (item.id_master && !ids.has(item.id_master)) {
        ids.add(item.id_master)
        options.push({ value: item.id_master, label: item.analisis_master?.nama ?? `Master #${item.id_master}` })
      }
    }
    return options
  })()

  const enhancedFields = fields.map((f) =>
    f.name === "id_master"
      ? { ...f, options: masterOptions.length > 0 ? masterOptions : [{ value: 0, label: "Master akan tersedia setelah data ditambahkan" }] }
      : f
  )

  return (
    <CrudManager
      title="Kategori Indikator"
      endpoint="/api/analisis/kategori_indikator"
      columns={columns}
      fields={enhancedFields}
      rowKey={(r) => r.id}
    />
  )
}
