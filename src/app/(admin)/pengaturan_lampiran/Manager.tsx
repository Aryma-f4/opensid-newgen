"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama", render: (r: any) => <span className="font-medium">{r.nama}</span> },
  { key: "slug", label: "Slug" },
  {
    key: "jenis",
    label: "Jenis",
    render: (r: any) => (r.jenis === 1 ? "Form" : "Dokumen"),
  },
  {
    key: "status",
    label: "Status",
    render: (r: any) => (r.status === 1 ? "Aktif" : "Non-aktif"),
  },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "slug" as const, label: "Slug", type: "text" as const },
  {
    name: "jenis" as const,
    label: "Jenis",
    type: "select" as const,
    options: [
      { value: "1", label: "Form" },
      { value: "2", label: "Dokumen" },
    ],
  },
  { name: "template" as const, label: "Template", type: "textarea" as const },
  {
    name: "status" as const,
    label: "Status",
    type: "select" as const,
    options: [
      { value: "1", label: "Aktif" },
      { value: "0", label: "Non-aktif" },
    ],
  },
]

export default function Manager() {
  return (
    <CrudManager
      title="Pengaturan Lampiran"
      endpoint="/api/pengaturan_lampiran"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
    />
  )
}
