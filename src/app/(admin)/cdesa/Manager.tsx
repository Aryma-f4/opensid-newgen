"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "nomor", label: "Nomor", render: (r: any) => <span className="font-mono">{r.nomor}</span> },
  { key: "nama_kepemilikan", label: "Nama Kepemilikan" },
  { key: "jenis_pemilik", label: "Jenis Pemilik", render: (r: any) => <StatusLabel ok={r.jenis_pemilik === true} /> },
]

const fields = [
  { name: "nomor" as const, label: "Nomor", type: "text" as const, required: true },
  { name: "nama_kepemilikan" as const, label: "Nama Kepemilikan", type: "text" as const, required: true },
  { name: "jenis_pemilik" as const, label: "Jenis Pemilik", type: "number" as const, help: "1 = Ya, 0 = Tidak" },
]

export default function Manager() {
  return (
    <CrudManager
      title="C-DESA"
      endpoint="/api/cdesa"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
