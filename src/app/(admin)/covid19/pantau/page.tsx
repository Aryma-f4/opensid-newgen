"use client"

import CrudManager from "@/components/admin/CrudManager"

type Covid19PantauRow = {
  id: number
  suhu_tubuh: string | null
  batuk: string | null
  sesak_nafas: string | null
}

export default function Page() {
  return (
    <CrudManager<Covid19PantauRow>
      title="Covid-19 Pantau"
      endpoint="/api/covid19/pantau"
      rowKey={(row) => row.id}
      columns={[
        { key: "suhu_tubuh", label: "Suhu" },
        { key: "batuk", label: "Batuk", render: (row) => row.batuk ?? "-" },
        {
          key: "sesak_nafas",
          label: "Sesak Nafas",
          render: (row) => row.sesak_nafas ?? "-",
        },
      ]}
      fields={[
        { name: "suhu_tubuh", label: "Suhu Tubuh", type: "text" },
        { name: "batuk", label: "Batuk", type: "text" },
        { name: "sesak_nafas", label: "Sesak Nafas", type: "text" },
      ]}
    />
  )
}
