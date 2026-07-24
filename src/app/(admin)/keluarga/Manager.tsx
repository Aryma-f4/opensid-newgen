"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import CrudManager from "@/components/admin/CrudManager"
import { StatusLabel } from "@/components/admin/Ui"

const columns = [
  { key: "no_kk", label: "No. KK", render: (r: any) => <span className="font-mono">{r.no_kk ?? "-"}</span> },
  { key: "kepala", label: "Kepala Keluarga", render: (r: any) => r.tweb_penduduk_tweb_keluarga_nik_kepalaTotweb_penduduk?.nama ?? "-" },
  { key: "nik", label: "NIK", render: (r: any) => <span className="font-mono">{r.tweb_penduduk_tweb_keluarga_nik_kepalaTotweb_penduduk?.nik ?? "-"}</span> },
  { key: "alamat", label: "Alamat", render: (r: any) => <span className="max-w-48 truncate block">{r.alamat ?? "-"}</span> },
  { key: "tgl_daftar", label: "Tgl Daftar", render: (r: any) => r.tgl_daftar ? new Date(r.tgl_daftar).toLocaleDateString("id-ID") : "-" },
]

const fields = [
  { name: "no_kk" as const, label: "No. KK", type: "text" as const, required: true },
  { name: "nik_kepala" as const, label: "NIK Kepala Keluarga (masukkan ID penduduk)", type: "number" as const },
  { name: "tgl_daftar" as const, label: "Tgl Daftar", type: "date" as const },
  { name: "alamat" as const, label: "Alamat", type: "text" as const },
]

export default function Manager({
  initialDusun,
  initialKelasSosial,
  dusunList,
}: {
  initialDusun?: string
  initialKelasSosial?: string
  dusunList?: string[]
}) {
  const router = useRouter()

  const extraParams = useMemo(() => ({
    dusun: initialDusun || undefined,
    kelas_sosial: initialKelasSosial || undefined,
  }), [initialDusun, initialKelasSosial])

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          {dusunList && dusunList.length > 0 && (
            <div className="min-w-[160px]">
              <label className="block text-xs text-gray-500 mb-1">Dusun</label>
              <select
                name="dusun"
                defaultValue={initialDusun ?? ""}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) url.searchParams.set("dusun", e.target.value)
                  else url.searchParams.delete("dusun")
                  router.push(url.pathname + url.search)
                }}
                className="w-full border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm"
              >
                <option value="">Semua Dusun</option>
                {dusunList.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
          <div className="min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">Kelas Sosial</label>
            <select
              name="kelas_sosial"
              defaultValue={initialKelasSosial ?? ""}
              onChange={(e) => {
                const url = new URL(window.location.href)
                if (e.target.value) url.searchParams.set("kelas_sosial", e.target.value)
                else url.searchParams.delete("kelas_sosial")
                router.push(url.pathname + url.search)
              }}
              className="w-full border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm"
            >
              <option value="">Semua Kelas</option>
              <option value="1">Keluarga Sejahtera I</option>
              <option value="2">Keluarga Sejahtera II</option>
              <option value="3">Keluarga Sejahtera III</option>
              <option value="4">Keluarga Sejahtera III Plus</option>
            </select>
          </div>
          {(initialDusun || initialKelasSosial) && (
            <a href="/keluarga" className="text-sm text-gray-500 hover:underline self-center ml-2">
              Reset
            </a>
          )}
        </form>
      </div>

      <CrudManager
        title="Keluarga"
        endpoint="/api/keluarga"
        columns={columns}
        fields={fields}
        rowKey={(r) => r.id}
        extraParams={extraParams}
        extraRowActions={[
          {
            label: "Detail",
            icon: "fa-eye",
            href: (r: any) => `/keluarga/${r.id}`,
          },
        ]}
      />
    </div>
  )
}
