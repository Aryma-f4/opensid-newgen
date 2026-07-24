"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "judul", label: "Judul" },
  { key: "tautan", label: "Tautan" },
  { key: "urut", label: "Urut" },
  { key: "status", label: "Status", render: (r: any) => r.status ? "Aktif" : "Nonaktif" },
]

const fields = [
  { name: "judul" as const, label: "Judul", type: "text" as const, required: true },
  { name: "tautan" as const, label: "Tautan", type: "url" as const, required: true },
  { name: "urut" as const, label: "Urut", type: "number" as const },
  { name: "status" as const, label: "Status", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Nonaktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Sinergi Program"
      endpoint="/api/sinergi_program"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.uuid}
    />
  )
}
