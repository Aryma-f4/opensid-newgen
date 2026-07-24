"use client"

import CrudManager from "@/components/admin/CrudManager"

type AlasanKeluarRow = {
  id: number
  alasan: string
  keterangan: string | null
}

export default function Page() {
  return (
    <CrudManager<AlasanKeluarRow>
      title="Alasan Keluar"
      endpoint="/api/kehadiran/alasan_keluar"
      rowKey={(row) => row.id}
      columns={[
        { key: "alasan", label: "Alasan" },
        { key: "keterangan", label: "Keterangan" },
      ]}
      fields={[
        { name: "alasan", label: "Alasan", type: "text", required: true },
        { name: "keterangan", label: "Keterangan", type: "text" },
      ]}
    />
  )
}
