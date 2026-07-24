"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "owner", label: "Pengirim", render: (r: any) => (
    <div>
      <div className="font-medium">{r.owner}</div>
      <div className="text-xs text-gray-500">{r.email ?? r.no_hp ?? ""}</div>
    </div>
  )},
  { key: "komentar", label: "Komentar", render: (r: any) => <span className="max-w-md block"><p className="line-clamp-2">{r.komentar}</p></span> },
  { key: "artikel", label: "Artikel", render: (r: any) => r.artikel?.judul ? <span className="max-w-48 truncate block">{r.artikel.judul}</span> : "-" },
  { key: "tgl_upload", label: "Tanggal", render: (r: any) => new Date(r.tgl_upload).toLocaleDateString("id-ID") },
  { key: "status", label: "Status", render: (r: any) => r.status ? (
    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">Aktif</span>
  ) : (
    <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded">Menunggu</span>
  )},
]

const fields = [
  { name: "owner" as const, label: "Pengirim", type: "text" as const, required: true },
  { name: "email" as const, label: "Email", type: "email" as const },
  { name: "no_hp" as const, label: "No. HP", type: "text" as const },
  { name: "komentar" as const, label: "Komentar", type: "textarea" as const, required: true },
  { name: "status" as const, label: "Status", type: "select" as const, options: [{ value: 1, label: "Aktif" }, { value: 0, label: "Menunggu" }], defaultValue: 0 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Komentar"
      endpoint="/api/komentar"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
