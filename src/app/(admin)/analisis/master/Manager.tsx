"use client"

import { use, useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"

type MasterType = {
  id: number
  nama: string
  subjek_tipe: number | null
  lock: boolean
  deskripsi: string
  kode_analisis: string
  jenis: number
  analisis_ref_subjek: { subjek: string } | null
  _count: { analisis_indikator: number; analisis_periode: number }
}

const columns = [
  { key: "nama", label: "Nama Survey", render: (r: MasterType) => <span className="font-medium">{r.nama}</span> },
  { key: "subjek_tipe", label: "Subjek", render: (r: MasterType) => r.analisis_ref_subjek?.subjek ?? "-" },
  { key: "deskripsi", label: "Deskripsi", render: (r: MasterType) => <span className="text-gray-500 text-xs max-w-xs truncate block">{r.deskripsi}</span> },
  { key: "lock", label: "Status", render: (r: MasterType) => r.lock ? <span className="label label-success">Aktif</span> : <span className="label label-default">Non-aktif</span> },
  { key: "_count", label: "Indikator", render: (r: MasterType) => r._count.analisis_indikator },
  { key: "_count", label: "Periode", render: (r: MasterType) => r._count.analisis_periode },
]

const fields = [
  { name: "nama" as const, label: "Nama Survey", type: "text" as const, required: true },
  { name: "subjek_tipe" as const, label: "Subjek Tipe", type: "select" as const, options: [{ value: 1, label: "Penduduk" }, { value: 2, label: "Keluarga" }] },
  { name: "deskripsi" as const, label: "Deskripsi", type: "textarea" as const },
  { name: "lock" as const, label: "Aktif", type: "checkbox" as const },
  { name: "kode_analisis" as const, label: "Kode Analisis", type: "text" as const },
]

export default function Manager({ initial }: { initial?: MasterType[] }) {
  return (
    <CrudManager
      title="Analisis Master"
      endpoint="/api/analisis/master"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
