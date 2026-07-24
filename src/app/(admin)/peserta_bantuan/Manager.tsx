"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "kartu_nama", label: "Nama" },
  { key: "kartu_nik", label: "NIK", render: (r: any) => <span className="font-mono">{r.kartu_nik}</span> },
  { key: "peserta", label: "No. Peserta" },
  { key: "no_id_kartu", label: "No. ID Kartu" },
]

const fields = [
  { name: "kartu_nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "kartu_nik" as const, label: "NIK", type: "text" as const, required: true },
  { name: "peserta" as const, label: "No. Peserta", type: "text" as const },
  { name: "no_id_kartu" as const, label: "No. ID Kartu", type: "text" as const },
  { name: "kartu_alamat" as const, label: "Alamat", type: "text" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Peserta Bantuan"
      endpoint="/api/peserta_bantuan"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
