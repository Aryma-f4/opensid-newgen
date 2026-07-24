"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "urut", label: "Urut", render: (r: any) => <span className="text-center block">{r.urut ?? "-"}</span> },
  { key: "teks", label: "Teks", render: (r: any) => <span className="max-w-lg block"><p className="line-clamp-2">{r.teks}</p></span> },
  { key: "tautan", label: "Tautan", render: (r: any) => r.tautan ? `${r.judul_tautan ?? r.tautan}` : "-" },
  { key: "status", label: "Status", render: (r: any) => <StatusLabel ok={r.status === true || r.status === 1} /> },
]

const fields = [
  { name: "teks" as const, label: "Teks", type: "textarea" as const, required: true },
  { name: "urut" as const, label: "Urutan", type: "number" as const },
  { name: "tautan" as const, label: "Tautan", type: "url" as const },
  { name: "judul_tautan" as const, label: "Judul Tautan", type: "text" as const },
  { name: "status" as const, label: "Aktif", type: "checkbox" as const, defaultValue: false },
]

export default function Manager() {
  return (
    <CrudManager
      title="Teks Berjalan"
      endpoint="/api/teks_berjalan"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
