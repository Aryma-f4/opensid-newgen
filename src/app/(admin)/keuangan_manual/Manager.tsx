"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "uraian", label: "Uraian", render: (r: any) => <span className="font-medium">{r.uraian}</span> },
  { key: "parent_uuid", label: "Parent UUID" },
]

const fields = [
  { name: "uraian" as const, label: "Uraian", type: "text" as const, required: true },
  { name: "parent_uuid" as const, label: "Parent UUID", type: "text" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Keuangan Manual"
      endpoint="/api/keuangan_manual"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
