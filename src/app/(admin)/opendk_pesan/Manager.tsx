"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "judul", label: "Judul", render: (r: any) => <span className="font-medium">{r.judul}</span> },
  { key: "isi", label: "Pesan", render: (r: any) => <span className="max-w-xs truncate block">{r.isi}</span> },
  { key: "read", label: "Status", render: (r: any) => r.read ? "Dibaca" : "Belum Dibaca" },
]

const fields = [
  { name: "judul" as const, label: "Judul", type: "text" as const, required: true },
  { name: "isi" as const, label: "Pesan", type: "textarea" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="OpenDK Pesan"
      endpoint="/api/opendk_pesan"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
