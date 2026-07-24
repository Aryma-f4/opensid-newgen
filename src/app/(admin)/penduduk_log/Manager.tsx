"use client"

import { useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "nik", label: "NIK" },
  { key: "nama", label: "Nama" },
  { key: "keterangan", label: "Keterangan" },
]

const fields = [
  { name: "nik" as const, label: "NIK", type: "text" as const, required: true },
  { name: "nama" as const, label: "Nama", type: "text" as const, required: true },
  { name: "keterangan" as const, label: "Keterangan", type: "text" as const },
]

export default function Manager({ tglFrom, tglTo }: { tglFrom?: string; tglTo?: string }) {
  const extraParams = useMemo(() => ({
    tgl_peristiwa_from: tglFrom || undefined,
    tgl_peristiwa_to: tglTo || undefined,
  }), [tglFrom, tglTo])

  return (
    <div>
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tanggal Peristiwa Dari</label>
            <input type="date" name="tgl_from" defaultValue={tglFrom ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sampai</label>
            <input type="date" name="tgl_to" defaultValue={tglTo ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
          </div>
          <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
          {(tglFrom || tglTo) && (
            <a href="/penduduk_log" className="text-sm text-gray-500 hover:underline self-center ml-2">Reset</a>
          )}
        </form>
      </div>
      <CrudManager
        title="Log Penduduk"
        endpoint="/api/penduduk_log"
        columns={columns}
        fields={fields}
        rowKey={(r: any) => r.id}
        extraParams={extraParams}
      />
    </div>
  )
}
