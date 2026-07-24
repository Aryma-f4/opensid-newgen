"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "simbol", label: "Simbol" },
]

const fields = [
  { name: "simbol" as const, label: "Simbol", type: "text" as const, required: true },
]

export default function Manager() {
  return (
    <CrudManager
      title="Simbol"
      endpoint="/api/simbol"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
