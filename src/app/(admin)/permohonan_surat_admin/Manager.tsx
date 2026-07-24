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
    label: "Selesai",
    icon: "fa-check",
    onClick: async (r) => {
      await fetch(`/api/permohonan_surat_admin/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: true }),
      })
      window.location.reload()
    },
    className: "text-green-600",
    show: (r) => !r.status,
  },
  {
    label: "Tolak",
    icon: "fa-times",
    onClick: async (r) => {
      const alasan = prompt("Alasan penolakan:")
      if (alasan === null) return
      await fetch(`/api/permohonan_surat_admin/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: false, alasan }),
      })
      window.location.reload()
    },
    className: "text-red-600",
    confirm: "Tolak permohonan ini?",
    show: (r) => !r.status,
  },
]

const columns = [
  { key: "nama", label: "Nama" },
  { key: "keperluan", label: "Keperluan" },
  { key: "created_at", label: "Tanggal", render: (r: any) => r.created_at?.toLocaleDateString?.("id-ID") ?? "-" },
  { key: "no_hp_aktif", label: "No. HP" },
  { key: "status", label: "Status", render: (r: any) => {
    if (r.alasan) {
      if (r.status) return <span className="label label-success">Selesai</span>
      return <span className="label label-danger">Ditolak</span>
    }
    if (r.status) return <span className="label label-success">Selesai</span>
    return <span className="label label-warning">Diproses</span>
  }},
  { key: "alasan", label: "Alasan", render: (r: any) => r.alasan ? <span className="max-w-48 truncate block text-red-600">{r.alasan}</span> : "-" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "keperluan" as const, label: "Keperluan", type: "text" as const },
  { name: "no_hp_aktif" as const, label: "No. HP", type: "text" as const },
  { name: "status" as const, label: "Status", type: "select" as const, options: [
    { value: 1, label: "Selesai" },
    { value: 0, label: "Diproses" },
  ]},
  { name: "alasan" as const, label: "Alasan", type: "textarea" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Permohonan Surat"
      endpoint="/api/permohonan_surat_admin"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id}
      extraRowActions={extraRowActions}
    />
  )
}
