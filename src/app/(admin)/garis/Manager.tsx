"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "enabled", label: "Status", render: (r: any) => <StatusLabel ok={r.enabled === 1} /> },
  { key: "desk", label: "Deskripsi", render: (r: any) => r.desk ? <span className="max-w-xs truncate block">{r.desk}</span> : "-" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "desk" as const, label: "Deskripsi", type: "textarea" as const },
  { name: "enabled" as const, label: "Aktif", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Nonaktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Garis"
      endpoint="/api/garis"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
