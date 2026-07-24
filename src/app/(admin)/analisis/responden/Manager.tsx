"use client"

import { useState, useEffect } from "react"
import { ContentHeader, Box, Btn } from "@/components/admin/Ui"

type RespondenRow = {
  id_subjek: number | null
  id_periode: number | null
  penduduk_id: number | null
  keluarga_id: number | null
  penduduk_nama: string | null
  penduduk_nik: string | null
  keluarga_no_kk: string | null
  periode_nama: string | null
  master_nama: string | null
  master_id: number | null
  total_indikator: number
  total_terjawab: number
}

export default function Manager({
  masterList,
  periodeList,
}: {
  masterList: { id: number; nama: string }[]
  periodeList: { id: number; nama: string }[]
}) {
  const [rows, setRows] = useState<RespondenRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [idMaster, setIdMaster] = useState("")
  const [idPeriode, setIdPeriode] = useState("")
  const [loading, setLoading] = useState(false)

  const perPage = 20

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        ...(search ? { q: search } : {}),
        ...(idMaster ? { id_master: idMaster } : {}),
        ...(idPeriode ? { id_periode: idPeriode } : {}),
      })
      const res = await fetch(`/api/analisis/responden?${params}`)
      const data = await res.json()
      setRows(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])
  useEffect(() => { setPage(1) }, [search, idMaster, idPeriode])

  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div>
      <ContentHeader title="Responden" breadcrumb={[{ label: "Analisis" }, { label: "Responden" }]} />

      <Box title="Filter" noPadding>
        <div className="p-3 flex flex-wrap gap-3 items-end">
          <div className="min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Cari</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama / NIK / No. KK..."
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Master Survey</label>
            <select
              value={idMaster}
              onChange={(e) => setIdMaster(e.target.value)}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            >
              <option value="">Semua Survey</option>
              {masterList.map((m) => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Periode</label>
            <select
              value={idPeriode}
              onChange={(e) => setIdPeriode(e.target.value)}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            >
              <option value="">Semua Periode</option>
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
          <Btn color="primary" onClick={load}>
            <i className="fa fa-search" /> Cari
          </Btn>
        </div>
      </Box>

      <Box title={`Daftar Responden (${total})`} noPadding>
        <div className="table-responsive table-responsive-mobile">
          <table className="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Responden</th>
                <th>NIK / No. KK</th>
                <th>Survey</th>
                <th>Periode</th>
                <th className="text-center">Terjawab</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Memuat...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada data responden</td></tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={`${row.id_subjek}-${row.id_periode}`} className="hover:bg-gray-50">
                    <td className="p-2">{(page - 1) * perPage + i + 1}</td>
                    <td className="p-2 font-medium">{row.penduduk_nama ?? row.keluarga_no_kk ?? "-"}</td>
                    <td className="p-2">{row.penduduk_nik ?? row.keluarga_no_kk ?? "-"}</td>
                    <td className="p-2">{row.master_nama ?? "-"}</td>
                    <td className="p-2">{row.periode_nama ?? "-"}</td>
                    <td className="p-2 text-center">{row.total_terjawab}</td>
                    <td className="p-2 text-center">{row.total_indikator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Box>

      {pages > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            &larr;
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm ${p === page ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
