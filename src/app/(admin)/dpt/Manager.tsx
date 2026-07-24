"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama" },
  { key: "nik", label: "NIK", render: (r: any) => <span className="font-mono">{r.nik ?? "-"}</span> },
  { key: "alamat", label: "Alamat", render: (r: any) => <span className="max-w-md truncate block">{r.alamat ?? "-"}</span> },
  { key: "tps", label: "TPS" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "nik" as const, label: "NIK", type: "text" as const },
  { name: "alamat" as const, label: "Alamat", type: "text" as const },
  { name: "tps" as const, label: "TPS", type: "text" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="DPT"
      endpoint="/api/dpt"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
