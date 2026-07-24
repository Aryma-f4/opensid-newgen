"use client"
import { useMemo } from "react"
import CrudManager from "@/components/admin/CrudManager"

export default function Manager({ tglFrom, tglTo }: { tglFrom?: string; tglTo?: string }) {
  const extraParams = useMemo(() => ({
    tgl_surat_from: tglFrom || undefined,
    tgl_surat_to: tglTo || undefined,
  }), [tglFrom, tglTo])

  return (
    <div>
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tanggal Surat Dari</label>
            <input type="date" name="tgl_from" defaultValue={tglFrom ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sampai</label>
            <input type="date" name="tgl_to" defaultValue={tglTo ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
          </div>
          <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
          {(tglFrom || tglTo) && (
            <a href="/surat_masuk" className="text-sm text-gray-500 hover:underline self-center ml-2">Reset</a>
          )}
        </form>
      </div>
      <CrudManager title="Surat Masuk" endpoint="/api/surat_masuk" rowKey={(r: any) => r.id}
        extraParams={extraParams}
        columns={[
          { key: "nomor_surat", label: "No Surat" },
          { key: "pengirim", label: "Pengirim" },
          { key: "tanggal_surat", label: "Tanggal", render: (r: any) => r.tanggal_surat?.toLocaleDateString?.("id-ID") ?? "-" },
          { key: "perihal", label: "Perihal" },
        ]}
        fields={[
          { name: "nomor_surat", label: "No Surat", type: "text" },
          { name: "pengirim", label: "Pengirim", type: "text", required: true },
          { name: "tanggal_surat", label: "Tanggal", type: "date" },
          { name: "perihal", label: "Perihal", type: "textarea" },
        ]}
      />
    </div>
  )
}
