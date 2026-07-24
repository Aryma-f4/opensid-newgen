"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "dari", label: "Dari" },
  { key: "sampai", label: "Sampai" },
  { key: "nama", label: "Keterangan" },
  { key: "status", label: "Status", render: (r: any) => r.status ? "Aktif" : "Non-aktif" },
]

const fields = [
  { name: "dari" as const, label: "Dari", type: "number" as const, required: true },
  { name: "sampai" as const, label: "Sampai", type: "number" as const, required: true },
  { name: "nama" as const, label: "Keterangan", type: "text" as const, required: true },
  { name: "status" as const, label: "Status", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Non-aktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Rentang Umur"
      endpoint="/api/rentang_umur"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
