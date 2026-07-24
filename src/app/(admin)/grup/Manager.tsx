"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "nama", label: "Nama Grup", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "slug", label: "Slug", render: (r: any) => <span className="font-mono">{r.slug ?? "-"}</span> },
  { key: "userCount", label: "Jml Pengguna", render: (r: any) => <span className="text-center block">{r.user?.length ?? 0}</span> },
  { key: "status", label: "Status", render: (r: any) => <StatusLabel ok={r.status === 1} /> },
]

const fields = [
  { name: "nama" as const, label: "Nama Grup", type: "text" as const, required: true },
  { name: "slug" as const, label: "Slug", type: "text" as const },
  { name: "status" as const, label: "Status", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Nonaktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Grup Pengguna"
      endpoint="/api/grup"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
