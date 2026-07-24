"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "judul", label: "Judul", render: (r: any) => <span className="font-medium">{r.judul}</span> },
  { key: "jenis", label: "Jenis" },
  { key: "server", label: "Server" },
  { key: "aktif", label: "Aktif", render: (r: any) => <StatusLabel ok={r.aktif === 1} /> },
]

const fields = [
  { name: "judul" as const, label: "Judul", type: "text" as const, required: true },
  { name: "jenis" as const, label: "Jenis", type: "text" as const },
  { name: "isi" as const, label: "Isi", type: "textarea" as const },
  { name: "server" as const, label: "Server", type: "text" as const },
  { name: "frekuensi" as const, label: "Frekuensi", type: "number" as const },
  { name: "aksi" as const, label: "Aksi", type: "text" as const },
  { name: "aktif" as const, label: "Aktif", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Nonaktif" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Notifikasi"
      endpoint="/api/notifikasi"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
