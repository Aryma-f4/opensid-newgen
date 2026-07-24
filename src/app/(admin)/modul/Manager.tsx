"use client"

import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "modul", label: "Modul" },
  { key: "url", label: "URL", render: (r: any) => <span className="font-mono">{r.url ?? "-"}</span> },
  { key: "ikon", label: "Ikon", render: (r: any) => r.ikon ? <i className={`fa ${r.ikon}`} /> : "-" },
  { key: "parent", label: "Parent" },
  { key: "aktif", label: "Aktif", render: (r: any) => <StatusLabel ok={r.aktif === 1} /> },
]

const fields = [
  { name: "modul" as const, label: "Modul", type: "text" as const, required: true },
  { name: "url" as const, label: "URL", type: "text" as const },
  { name: "ikon" as const, label: "Ikon", type: "text" as const, help: "Font Awesome class e.g. fa-users" },
  { name: "parent" as const, label: "Parent", type: "number" as const, defaultValue: 0 },
  { name: "urut" as const, label: "Urutan", type: "number" as const },
  { name: "aktif" as const, label: "Aktif", type: "select" as const, options: [{ value: 1, label: "Ya" }, { value: 0, label: "Tidak" }], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Manajemen Modul"
      endpoint="/api/modul"
      columns={columns}
      fields={fields}
      rowKey={(r) => r.id}
    />
  )
}
