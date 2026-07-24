"use client"

import CrudManager from "@/components/admin/CrudManager"

type HariLiburRow = {
  id: number
  tanggal: string
  keterangan: string | null
}

export default function Page() {
  return (
    <CrudManager<HariLiburRow>
      title="Hari Libur"
      endpoint="/api/kehadiran/hari_libur"
      rowKey={(row) => row.id}
      columns={[
        {
          key: "tanggal",
          label: "Tanggal",
          render: (row) => new Date(row.tanggal).toLocaleDateString("id-ID"),
        },
        { key: "keterangan", label: "Keterangan" },
      ]}
      fields={[
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        { name: "keterangan", label: "Keterangan", type: "text" },
      ]}
    />
  )
}
