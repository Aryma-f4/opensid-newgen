"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "id_kelompok", label: "ID Kelompok" },
  { key: "id_penduduk", label: "ID Penduduk" },
]

const fields = [
  { name: "id_kelompok" as const, label: "ID Kelompok", type: "number" as const, required: true },
  { name: "id_penduduk" as const, label: "ID Penduduk", type: "number" as const, required: true },
]

export default function Manager() {
  return (
    <CrudManager
      title="Kelompok Anggota"
      endpoint="/api/kelompok_anggota"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
