"use client"

import CrudManager from "@/components/admin/CrudManager"

type PengaduanRow = {
  id: number
  waktu: string
  keterangan: string | null
  status: boolean
}

export default function Page() {
  return (
    <CrudManager<PengaduanRow>
      title="Pengaduan Kehadiran"
      endpoint="/api/kehadiran/pengaduan"
      rowKey={(row) => row.id}
      columns={[
        {
          key: "waktu",
          label: "Waktu",
          render: (row) => new Date(row.waktu).toLocaleString("id-ID"),
        },
        { key: "keterangan", label: "Keterangan", className: "max-w-xs truncate" },
        {
          key: "status",
          label: "Status",
          render: (row) => (row.status ? "Selesai" : "Belum selesai"),
        },
      ]}
      fields={[
        { name: "waktu", label: "Waktu", type: "text", required: true },
        { name: "keterangan", label: "Keterangan", type: "text" },
        { name: "status", label: "Selesai", type: "checkbox" },
      ]}
    />
  )
}
