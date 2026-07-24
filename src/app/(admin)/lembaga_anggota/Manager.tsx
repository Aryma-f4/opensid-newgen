"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "id_kelompok", label: "ID Lembaga" },
  { key: "id_penduduk", label: "ID Penduduk" },
]

const fields = [
  { name: "id_kelompok" as const, label: "ID Lembaga", type: "number" as const, required: true },
  { name: "id_penduduk" as const, label: "ID Penduduk", type: "number" as const, required: true },
]

export default function Manager() {
  return (
    <CrudManager
      title="Lembaga Anggota"
      endpoint="/api/lembaga_anggota"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
