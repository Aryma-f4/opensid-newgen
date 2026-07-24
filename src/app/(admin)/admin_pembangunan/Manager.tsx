"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "judul", label: "Judul" },
  { key: "lokasi", label: "Lokasi" },
  { key: "tahun_anggaran", label: "Tahun" },
  { key: "anggaran", label: "Anggaran", render: (r: any) => Number(r.anggaran ?? 0).toLocaleString("id-ID") },
  { key: "status", label: "Status", render: (r: any) => r.status === 3 ? "Selesai" : "Aktif" },
]

const fields = [
  { name: "judul" as const, label: "Judul", type: "text" as const, required: true },
  { name: "lokasi" as const, label: "Lokasi", type: "text" as const },
  { name: "tahun_anggaran" as const, label: "Tahun", type: "number" as const },
  { name: "anggaran" as const, label: "Anggaran", type: "number" as const },
  { name: "status" as const, label: "Status", type: "select" as const, options: [{ value: 1, label: "Perencanaan" }, { value: 2, label: "Pelaksanaan" }, { value: 3, label: "Selesai" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Pembangunan"
      endpoint="/api/admin_pembangunan"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
