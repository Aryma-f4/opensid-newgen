"use client"

import CrudManager from "@/components/admin/CrudManager"

type KlasifikasiType = {
  id: number
  nama: string
  minval: number
  maxval: number
  id_master: number | null
  analisis_master: { nama: string } | null
}

const columns = [
  { key: "id_master", label: "Survey", render: (r: KlasifikasiType) => r.analisis_master?.nama ?? "-" },
  { key: "nama", label: "Nama Klasifikasi", render: (r: KlasifikasiType) => <span className="font-medium">{r.nama}</span> },
  { key: "minval", label: "Nilai Min" },
  { key: "maxval", label: "Nilai Max" },
]

export default function Manager({
  initial,
  masterList,
}: {
  initial?: KlasifikasiType[]
  masterList: { id: number; nama: string }[]
}) {
  const fields = [
    { name: "id_master" as const, label: "Survey", type: "select" as const, options: masterList.map((m) => ({ value: m.id, label: m.nama })) },
    { name: "nama" as const, label: "Nama Klasifikasi", type: "text" as const, required: true },
    { name: "minval" as const, label: "Nilai Minimum", type: "number" as const },
    { name: "maxval" as const, label: "Nilai Maksimum", type: "number" as const },
  ]

  return (
    <CrudManager
      title="Klasifikasi"
      endpoint="/api/analisis/klasifikasi"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
