"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "link", label: "Tautan", render: (r: any) => r.link ? <a href={r.link} target="_blank" className="text-blue-600 hover:underline max-w-md truncate block">{r.link}</a> : "-" },
  { key: "enabled", label: "Status", render: (r: any) => <StatusLabel ok={r.enabled === 1} /> },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "link" as const, label: "Tautan", type: "url" as const },
  { name: "gambar" as const, label: "URL Gambar", type: "text" as const },
  { name: "enabled" as const, label: "Status", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Nonaktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Media Sosial"
      endpoint="/api/sosmed"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
