"use client"

import CrudManager from "@/components/admin/CrudManager"

type JamKerjaRow = {
  id: number
  nama_hari: string
  jam_masuk: string
  jam_keluar: string
}

export default function Page() {
  return (
    <CrudManager<JamKerjaRow>
      title="Jam Kerja"
      endpoint="/api/kehadiran/jam_kerja"
      rowKey={(row) => row.id}
      columns={[
        { key: "nama_hari", label: "Hari" },
        { key: "jam_masuk", label: "Jam Masuk" },
        { key: "jam_keluar", label: "Jam Pulang" },
      ]}
      fields={[
        { name: "nama_hari", label: "Hari", type: "text", required: true },
        { name: "jam_masuk", label: "Jam Masuk", type: "text", required: true },
        { name: "jam_keluar", label: "Jam Pulang", type: "text", required: true },
      ]}
    />
  )
}
