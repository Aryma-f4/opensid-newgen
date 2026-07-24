"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "simbol", label: "Simbol" },
  { key: "tipe", label: "Tipe" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "simbol" as const, label: "Simbol", type: "text" as const },
  { name: "tipe" as const, label: "Tipe", type: "number" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Point"
      endpoint="/api/point"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
