"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "pengguna", label: "Nama" },
  { key: "pilihan", label: "Pilihan" },
  { key: "tanggal", label: "Tanggal", render: (r: any) => r.tanggal ? new Date(r.tanggal).toLocaleDateString("id-ID") : "-" },
]

const fields = [
  { name: "pengguna" as const, label: "Nama", type: "text" as const, required: true },
  { name: "pilihan" as const, label: "Pilihan", type: "number" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Pendapat"
      endpoint="/api/pendapat"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
