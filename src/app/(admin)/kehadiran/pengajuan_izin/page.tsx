"use client"

import CrudManager from "@/components/admin/CrudManager"

type PengajuanIzinRow = {
  id: string
  keterangan: string
  tanggal_mulai: string
  status_approval: string
}

export default function Page() {
  return (
    <CrudManager<PengajuanIzinRow>
      title="Pengajuan Izin"
      endpoint="/api/kehadiran/pengajuan_izin"
      rowKey={(row) => row.id}
      columns={[
        { key: "keterangan", label: "Alasan" },
        {
          key: "tanggal_mulai",
          label: "Mulai",
          render: (row) => new Date(row.tanggal_mulai).toLocaleDateString("id-ID"),
        },
        { key: "status_approval", label: "Status" },
      ]}
      fields={[
        { name: "keterangan", label: "Alasan", type: "text", required: true },
        { name: "tanggal_mulai", label: "Mulai", type: "date", required: true },
      ]}
    />
  )
}
