"use client"

import CrudManager from "@/components/admin/CrudManager"

type IndikatorType = {
  id: number
  nomor: string | null
  pertanyaan: string
  bobot: number
  is_publik: boolean
  is_teks: boolean
  id_master: number | null
  id_kategori: number | null
  id_tipe: number | null
  referensi: string | null
  analisis_kategori_indikator: { kategori: string } | null
  analisis_master: { nama: string } | null
  analisis_tipe_indikator: { tipe: string } | null
  _count: { analisis_parameter: number }
}

const columns = [
  { key: "nomor", label: "No", className: "w-16 text-center" },
  { key: "pertanyaan", label: "Pertanyaan", render: (r: IndikatorType) => <span className="font-medium max-w-xs truncate block">{r.pertanyaan}</span> },
  { key: "id_kategori", label: "Kategori", render: (r: IndikatorType) => r.analisis_kategori_indikator?.kategori ?? "-" },
  { key: "id_master", label: "Master", render: (r: IndikatorType) => r.analisis_master?.nama ?? "-" },
  { key: "bobot", label: "Bobot", className: "text-center" },
  { key: "is_publik", label: "Publik", render: (r: IndikatorType) => r.is_publik ? <span className="label label-success">Ya</span> : <span className="label label-default">Tidak</span> },
  { key: "_count", label: "Parameter", render: (r: IndikatorType) => r._count.analisis_parameter },
]

export default function Manager({
  initial,
  tipeIndikator,
  kategoriList,
  masterList,
}: {
  initial?: IndikatorType[]
  tipeIndikator: { id: number; tipe: string }[]
  kategoriList: { id: number; kategori: string; id_master: number | null }[]
  masterList: { id: number; nama: string }[]
}) {
  const fields = [
    { name: "id_master" as const, label: "Master Survey", type: "select" as const, options: masterList.map((m) => ({ value: m.id, label: m.nama })) },
    { name: "id_kategori" as const, label: "Kategori", type: "select" as const, options: kategoriList.map((k) => ({ value: k.id, label: k.kategori })) },
    { name: "id_tipe" as const, label: "Tipe Indikator", type: "select" as const, options: tipeIndikator.map((t) => ({ value: t.id, label: t.tipe })) },
    { name: "nomor" as const, label: "Nomor Urut", type: "text" as const },
    { name: "pertanyaan" as const, label: "Pertanyaan", type: "text" as const, required: true },
    { name: "bobot" as const, label: "Bobot", type: "number" as const },
    { name: "is_publik" as const, label: "Publik", type: "checkbox" as const },
    { name: "is_teks" as const, label: "Jawaban Teks", type: "checkbox" as const, help: "Jika ya, responden mengisi teks bebas" },
    { name: "referensi" as const, label: "Referensi", type: "text" as const },
  ]

  return (
    <CrudManager
      title="Indikator"
      endpoint="/api/analisis/indikator"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
