"use client"

import CrudManager from "@/components/admin/CrudManager"

type PeriodeType = {
  id: number
  nama: string
  aktif: boolean
  keterangan: string
  tahun_pelaksanaan: number
  id_master: number | null
  id_state: number | null
  analisis_master: { nama: string } | null
  analisis_ref_state: { nama: string } | null
}

const columns = [
  { key: "nama", label: "Periode", render: (r: PeriodeType) => <span className="font-medium">{r.nama}</span> },
  { key: "id_master", label: "Survey", render: (r: PeriodeType) => r.analisis_master?.nama ?? "-" },
  { key: "tahun_pelaksanaan", label: "Tahun" },
  { key: "aktif", label: "Status", render: (r: PeriodeType) => r.aktif ? <span className="label label-success">Aktif</span> : <span className="label label-default">Non-aktif</span> },
  { key: "keterangan", label: "Keterangan" },
]

export default function Manager({
  initial,
  masterList,
  stateList,
}: {
  initial?: PeriodeType[]
  masterList: { id: number; nama: string }[]
  stateList: { id: number; nama: string }[]
}) {
  const fields = [
    { name: "id_master" as const, label: "Master Survey", type: "select" as const, options: masterList.map((m) => ({ value: m.id, label: m.nama })) },
    { name: "nama" as const, label: "Nama Periode", type: "text" as const, required: true },
    { name: "tahun_pelaksanaan" as const, label: "Tahun Pelaksanaan", type: "number" as const },
    { name: "aktif" as const, label: "Aktif", type: "checkbox" as const },
    { name: "keterangan" as const, label: "Keterangan", type: "text" as const },
    { name: "id_state" as const, label: "State", type: "select" as const, options: stateList.map((s) => ({ value: s.id, label: s.nama })) },
  ]

  return (
    <CrudManager
      title="Periode"
      endpoint="/api/analisis/periode"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
