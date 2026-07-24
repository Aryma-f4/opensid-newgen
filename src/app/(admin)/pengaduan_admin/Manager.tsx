"use client"

import CrudManager from "@/components/admin/CrudManager"

type RowAction = {
  label: string
  icon?: string
  onClick: (row: any) => void
  className?: string
  confirm?: string
  show?: (row: any) => boolean
}

const extraRowActions: RowAction[] = [
  {
    label: "Proses",
    icon: "fa-play",
    onClick: async (r) => {
      await fetch(`/api/pengaduan_admin/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 2 }),
      })
      window.location.reload()
    },
    className: "text-yellow-600",
    show: (r) => r.status === 1,
  },
  {
    label: "Selesai",
    icon: "fa-check",
    onClick: async (r) => {
      await fetch(`/api/pengaduan_admin/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 3 }),
      })
      window.location.reload()
    },
    className: "text-green-600",
    show: (r) => r.status === 2,
  },
]

const columns = [
  { key: "nama", label: "Nama" },
  { key: "nik", label: "NIK" },
  { key: "judul", label: "Judul" },
  { key: "telepon", label: "Telepon" },
  { key: "status", label: "Status", render: (r: any) => {
    if (r.status === 3) return <span className="label label-success">Selesai</span>
    if (r.status === 2) return <span className="label label-warning">Diproses</span>
    return <span className="label label-info">Baru</span>
  }},
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "nik" as const, label: "NIK", type: "text" as const },
  { name: "judul" as const, label: "Judul", type: "text" as const },
  { name: "isi" as const, label: "Isi", type: "textarea" as const },
  { name: "telepon" as const, label: "Telepon", type: "text" as const },
  { name: "status" as const, label: "Status", type: "select" as const, options: [
    { value: 1, label: "Baru" },
    { value: 2, label: "Diproses" },
    { value: 3, label: "Selesai" },
  ], defaultValue: 1 },
]

export default function Manager() {
  return (
    <CrudManager
      title="Pengaduan"
      endpoint="/api/pengaduan_admin"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
      extraRowActions={extraRowActions}
    />
  )
}
