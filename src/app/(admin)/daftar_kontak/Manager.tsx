"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "telepon", label: "Telepon" },
  { key: "email", label: "Email" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "telepon" as const, label: "Telepon", type: "text" as const },
  { name: "email" as const, label: "Email", type: "email" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Daftar Kontak"
      endpoint="/api/daftar_kontak"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id_kontak}
    />
  )
}
