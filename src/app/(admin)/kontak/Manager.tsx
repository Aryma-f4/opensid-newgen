"use client"

import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nama", label: "Nama" },
  { key: "telepon", label: "Telepon" },
  { key: "email", label: "Email" },
  { key: "telegram", label: "Telegram" },
  { key: "hubung_warga", label: "Hubung Warga" },
  { key: "keterangan", label: "Keterangan" },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "telepon" as const, label: "Telepon", type: "text" as const },
  { name: "email" as const, label: "Email", type: "email" as const },
  { name: "telegram" as const, label: "Telegram", type: "text" as const },
  { name: "hubung_warga" as const, label: "Hubung Warga", type: "text" as const },
  { name: "keterangan" as const, label: "Keterangan", type: "text" as const },
]

export default function Manager() {
  return (
    <CrudManager
      title="Kontak"
      endpoint="/api/kontak"
      columns={columns}
      fields={fields}
      rowKey={(r: any) => r.id_kontak}
    />
  )
}
