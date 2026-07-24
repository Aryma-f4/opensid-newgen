"use client"

import CrudManager from "@/components/admin/CrudManager"

type ParameterType = {
  id: number
  jawaban: string
  nilai: number
  kode_jawaban: number | null
  id_indikator: number | null
  asign: boolean
  analisis_indikator: { pertanyaan: string; nomor: string | null } | null
}

const columns = [
  { key: "id_indikator", label: "Indikator", render: (r: ParameterType) => r.analisis_indikator ? <span className="max-w-xs truncate block text-xs">{r.analisis_indikator.nomor}. {r.analisis_indikator.pertanyaan}</span> : "-" },
  { key: "jawaban", label: "Jawaban", render: (r: ParameterType) => <span className="font-medium">{r.jawaban}</span> },
  { key: "nilai", label: "Nilai/Bobot", className: "text-center" },
  { key: "kode_jawaban", label: "Kode", className: "text-center" },
]

export default function Manager({
  initial,
  indikatorList,
}: {
  initial?: ParameterType[]
  indikatorList: { id: number; pertanyaan: string; nomor: string | null }[]
}) {
  const fields = [
    {
      name: "id_indikator" as const,
      label: "Indikator",
      type: "select" as const,
      options: indikatorList.map((i) => ({ value: i.id, label: `${i.nomor ?? ""} ${i.pertanyaan}`.trim() })),
    },
    { name: "jawaban" as const, label: "Jawaban", type: "text" as const, required: true },
    { name: "nilai" as const, label: "Nilai", type: "number" as const },
    { name: "kode_jawaban" as const, label: "Kode Jawaban", type: "number" as const },
  ]

  return (
    <CrudManager
      title="Parameter"
      endpoint="/api/analisis/parameter"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
