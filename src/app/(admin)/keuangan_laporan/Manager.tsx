"use client"

import { useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"

const columns = [
  { key: "tahun", label: "Tahun" },
  { key: "anggaran", label: "Anggaran", render: (r: any) => r.anggaran ? Number(r.anggaran).toLocaleString("id-ID") : "-" },
  { key: "realisasi", label: "Realisasi", render: (r: any) => r.realisasi ? Number(r.realisasi).toLocaleString("id-ID") : "-" },
]

const fields = [
  { name: "tahun" as const, label: "Tahun", type: "text" as const, required: true },
  { name: "anggaran" as const, label: "Anggaran", type: "number" as const },
  { name: "realisasi" as const, label: "Realisasi", type: "number" as const },
]

export default function Manager({ tahunFilter }: { tahunFilter?: string }) {
  const extraParams = useMemo(() => ({
    tahun: tahunFilter || undefined,
  }), [tahunFilter])

  return (
    <div>
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tahun</label>
            <select name="tahun" defaultValue={tahunFilter ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Tahun</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
          {tahunFilter && (
            <a href="/keuangan_laporan" className="text-sm text-gray-500 hover:underline self-center ml-2">Reset</a>
          )}
        </form>
      </div>
      <CrudManager
        title="Laporan Keuangan Desa"
        endpoint="/api/keuangan_laporan"
        columns={columns}
        fields={fields}
        rowKey={(r: any) => r.id}
        extraParams={extraParams}
      />
    </div>
  )
}
