"use client"

import { useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const sasaranLabel: Record<number, string> = { 1: "Penduduk", 2: "Keluarga" }

const columns = [
  { key: "nama", label: "Nama" },
  { key: "sasaran", label: "Sasaran", render: (r: any) => sasaranLabel[r.sasaran] ?? "-" },
  { key: "terdata", label: "Jml Terdata", render: (r: any) => r.suplemen_terdata?.length ?? 0 },
  { key: "keterangan", label: "Keterangan", render: (r: any) => <span className="max-w-64 truncate block">{r.keterangan ?? "-"}</span> },
  { key: "status", label: "Status", render: (r: any) => <StatusLabel ok={r.status === 1} /> },
]

const fields = [
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "sasaran" as const, label: "Sasaran", type: "select" as const, options: [{ value: 1, label: "Penduduk" }, { value: 2, label: "Keluarga" }], required: true },
  { name: "keterangan" as const, label: "Keterangan", type: "textarea" as const },
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
              <option value="1">Aktif</option>
              <option value="0">Non-aktif</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
          {statusFilter && (
            <a href="/suplemen" className="text-sm text-gray-500 hover:underline self-center ml-2">Reset</a>
          )}
        </form>
      </div>
      <CrudManager
        title="Data Suplemen"
        endpoint="/api/suplemen"
        columns={columns}
        fields={fields}
        rowKey={(r) => r.id}
        extraParams={extraParams}
      />
    </div>
  )
}
