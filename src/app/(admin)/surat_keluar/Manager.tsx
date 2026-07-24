"use client"
import { useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"

export default function Manager({ tglFrom, tglTo }: { tglFrom?: string; tglTo?: string }) {
  const extraParams = useMemo(() => ({
    tgl_from: tglFrom || undefined,
    tgl_to: tglTo || undefined,
  }), [tglFrom, tglTo])

  return (
    <div>
      {/* Date range filter bar */}
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tanggal Surat Dari</label>
            <input
              type="date"
              name="tgl_from"
              defaultValue={tglFrom ?? ""}
              className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sampai</label>
            <input
              type="date"
              name="tgl_to"
              defaultValue={tglTo ?? ""}
              className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            <i className="fa fa-search" /> Filter
          </button>
          {(tglFrom || tglTo) && (
            <a href="/surat_keluar" className="text-sm text-gray-500 hover:underline self-center ml-2">
              Reset
            </a>
          )}
        </form>
      </div>

      <CrudManager title="Surat Keluar" endpoint="/api/surat_keluar" rowKey={(r: any) => r.id}
        columns={[
          { key: "nomor_surat", label: "No Surat" },
          { key: "tujuan", label: "Tujuan" },
          { key: "tanggal_surat", label: "Tanggal", render: (r: any) => r.tanggal_surat?.toLocaleDateString?.("id-ID") ?? "-" },
          { key: "isi_singkat", label: "Isi Singkat" },
          { key: "keterangan", label: "Keterangan" },
        ]}
        fields={[
          { name: "nomor_surat", label: "No Surat", type: "text" },
          { name: "tujuan", label: "Tujuan", type: "text", required: true },
          { name: "tanggal_surat", label: "Tanggal", type: "date" },
          { name: "isi_singkat", label: "Isi Singkat", type: "textarea" },
          { name: "keterangan", label: "Keterangan", type: "text" },
        ]}
        extraParams={extraParams}
      />
    </div>
  )
}
