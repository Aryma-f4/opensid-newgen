"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "color", label: "Warna", render: (r: any) => r.color ? <span style={{ background: r.color, display: "inline-block", width: 20, height: 20, borderRadius: 4 }} /> : <span style={{ background: "#ccc", display: "inline-block", width: 20, height: 20, borderRadius: 4 }} /> },
  { key: "tipe", label: "Tipe" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "color" as const, label: "Warna", type: "text" as const },
  { name: "tipe" as const, label: "Tipe", type: "number" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Polygon"
      endpoint="/api/polygon"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
