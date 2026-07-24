"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "kode", label: "Kode", render: (r: any) => <span className="font-mono">{r.kode}</span> },
  { key: "nama", label: "Nama" },
  { key: "uraian", label: "Uraian", render: (r: any) => <span className="max-w-md truncate block">{r.uraian ?? "-"}</span> },
  { key: "enabled", label: "Status", render: (r: any) => <StatusLabel ok={r.enabled === 1} /> },
]

const fields = [
  { name: "kode" as const, label: "Kode", type: "text" as const, required: true },
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "uraian" as const, label: "Uraian", type: "textarea" as const },
  { name: "enabled" as const, label: "Aktif", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Nonaktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Klasifikasi Surat"
      endpoint="/api/klasifikasi"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
