"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "alamat", label: "Alamat", render: (r: any) => <span className="max-w-xs truncate block">{r.alamat ?? "-"}</span> },
  { key: "telepon", label: "Telepon" },
  { key: "keperluan", label: "Keperluan" },
  { key: "created_at", label: "Tanggal", render: (r: any) => r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID") : "-" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "telepon" as const, label: "Telepon", type: "text" as const },
  { name: "alamat" as const, label: "Alamat", type: "textarea" as const },
  { name: "instansi" as const, label: "Instansi", type: "text" as const },
  { name: "keperluan" as const, label: "Keperluan", type: "text" as const },
  { name: "status" as const, label: "Status", type: "select" as const, options: [
    { value: 0, label: "Pending" },
    { value: 1, label: "Diterima" },
    { value: 2, label: "Ditolak" },
  ], defaultValue: 0 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Buku Tamu"
      endpoint="/api/buku_tamu"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
