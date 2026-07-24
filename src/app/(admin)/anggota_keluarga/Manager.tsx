"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nik", label: "NIK" },
  { key: "nama", label: "Nama" },
  { key: "sex", label: "L/P", render: (r: any) => r.sex === 1 ? "L" : "P" },
  { key: "alamat_sekarang", label: "Alamat" },
]

const fields = [
  { name: "nik" as const, label: "NIK", type: "text" as const, required: true },
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "sex" as const, label: "L/P", type: "select" as const, options: [{ value: 1, label: "L" }, { value: 2, label: "P" }] },
  { name: "alamat_sekarang" as const, label: "Alamat", type: "text" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Anggota Keluarga"
      endpoint="/api/anggota_keluarga"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
