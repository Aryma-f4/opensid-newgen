"use client"

import { useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"

const sasaranLabel: Record<number, string> = { 1: "Penduduk", 2: "Keluarga", 3: "Rumah Tangga", 4: "Kelompok" }

const columns = [
  { key: "nama", label: "Nama Program" },
  { key: "sasaran", label: "Sasaran", render: (r: any) => sasaranLabel[r.sasaran] ?? r.sasaran },
  { key: "sdate", label: "Tgl Mulai", render: (r: any) => r.sdate ? new Date(r.sdate).toLocaleDateString("id-ID") : "-" },
  { key: "edate", label: "Tgl Selesai", render: (r: any) => r.edate ? new Date(r.edate).toLocaleDateString("id-ID") : "-" },
  { key: "asaldana", label: "Asal Dana" },
  { key: "ndesc", label: "Keterangan", render: (r: any) => <span className="max-w-48 truncate block">{r.ndesc ?? "-"}</span> },
]

const fields = [
  { name: "nama" as const, label: "Nama Program", type: "text" as const, required: true },
  { name: "sasaran" as const, label: "Sasaran", type: "select" as const, options: [
    { value: 1, label: "Penduduk" }, { value: 2, label: "Keluarga" },
    { value: 3, label: "Rumah Tangga" }, { value: 4, label: "Kelompok" },
  ], required: true },
  { name: "sdate" as const, label: "Tgl Mulai", type: "date" as const },
  { name: "edate" as const, label: "Tgl Selesai", type: "date" as const },
  { name: "asaldana" as const, label: "Asal Dana", type: "text" as const },
  { name: "ndesc" as const, label: "Keterangan", type: "textarea" as const },
]

export default function Manager({ statusFilter }: { statusFilter?: string }) {
  const extraParams = useMemo(() => ({
    status: statusFilter || undefined,
  }), [statusFilter])

  return (
    <div>
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select name="status" defaultValue={statusFilter ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="expired">Kadaluarsa</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
          {statusFilter && (
            <a href="/program_bantuan" className="text-sm text-gray-500 hover:underline self-center ml-2">Reset</a>
          )}
        </form>
      </div>
      <CrudManager
        title="Program Bantuan"
        endpoint="/api/program_bantuan"
        columns={columns}
        fields={fields}
        rowKey={(r) => r.id}
        extraParams={extraParams}
      />
    </div>
  )
}
