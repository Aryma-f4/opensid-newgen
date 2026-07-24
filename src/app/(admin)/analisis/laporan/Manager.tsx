"use client"

import { useState, useEffect } from "react"
import { ContentHeader, Box, Btn, SelectFilter } from "@/components/admin/Ui"

type IndikatorLaporan = {
  id: number
  nomor: string | null
  pertanyaan: string
  bobot: number
  kategori: string
  parameter: { id: number; jawaban: string; nilai: number; kode_jawaban: number | null }[]
  respon: { id_parameter: number; jawaban: string; nilai: number; jumlah: number }[]
  total_respon: number
}

type LaporanResponse = {
  master: { id: number; nama: string } | null
  indikators: IndikatorLaporan[]
  total_indikator: number
}

export default function Manager({
  masterList,
  periodeList,
}: {
  masterList: { id: number; nama: string }[]
  periodeList: { id: number; nama: string }[]
}) {
  const [idMaster, setIdMaster] = useState("")
  const [idPeriode, setIdPeriode] = useState("")
  const [data, setData] = useState<LaporanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!idMaster) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ id_master: idMaster })
      if (idPeriode) params.set("id_periode", idPeriode)
      const res = await fetch(`/api/analisis/laporan?${params}`)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      const result = await res.json()
      setData(result)
    } catch (e: any) {
      setError(e.message ?? "Gagal memuat laporan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (idMaster) loadData()
  }, [])

  return (
    <div>
      <ContentHeader title="Laporan Analisis" breadcrumb={[{ label: "Analisis" }, { label: "Laporan" }]} />

      <Box title="Filter" noPadding>
        <div className="p-3 flex flex-wrap gap-3 items-end">
          <div className="min-w-[250px]">
            <label className="block text-xs text-gray-500 mb-1">Survey</label>
            <select
              value={idMaster}
              onChange={(e) => { setIdMaster(e.target.value); setData(null) }}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            >
              <option value="">Pilih Survey...</option>
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
          <Btn color="primary" onClick={loadData} disabled={!idMaster || loading}>
            <i className="fa fa-search" /> Tampilkan
          </Btn>
        </div>
      </Box>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-3">{error}</div>
      )}

      {loading && (
        <div className="text-center text-gray-400 py-8">Memuat laporan...</div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          <Box>
            <p className="text-sm text-gray-600">
              Survey: <strong>{data.master?.nama ?? "-"}</strong> |
              Total Indikator: <strong>{data.total_indikator}</strong>
            </p>
          </Box>

          {data.indikators.map((ind) => (
            <Box key={ind.id} title={`${ind.nomor ?? ""}. ${ind.pertanyaan}`} noPadding>
              <div className="p-3 text-sm">
                <div className="flex gap-4 text-gray-500 mb-2">
                  <span>Kategori: {ind.kategori}</span>
                  <span>Bobot: {ind.bobot}</span>
                  <span>Total Jawaban: {ind.total_respon}</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover text-sm">
                    <thead>
                      <tr>
                        <th>Jawaban</th>
                        <th className="text-center">Nilai</th>
                        <th className="text-center">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ind.respon.length > 0 ? (
                        ind.respon.map((r) => (
                          <tr key={r.id_parameter}>
                            <td className="font-medium">{r.jawaban}</td>
                            <td className="text-center">{r.nilai}</td>
                            <td className="text-center">{r.jumlah}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="text-center text-gray-400">Belum ada jawaban</td></tr>
                      )}
                      {ind.total_respon > 0 && (
                        <tr className="bg-gray-100 font-semibold">
                          <td>Total</td>
                          <td></td>
                          <td className="text-center">{ind.total_respon}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ind.parameter.map((p) => {
                    const respon = ind.respon.find((r) => r.id_parameter === p.id)
                    const pct = ind.total_respon > 0 ? ((respon?.jumlah ?? 0) / ind.total_respon) * 100 : 0
                    return (
                      <div key={p.id} className="flex-1 min-w-[120px]">
                        <div className="text-xs text-gray-600 mb-1">{p.jawaban}: {respon?.jumlah ?? 0} ({pct.toFixed(1)}%)</div>
                        <div className="h-2 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Box>
          ))}
        </div>
      )}

      {!idMaster && !loading && (
        <Box>
          <p className="text-center text-gray-400 py-4">Pilih survey untuk melihat laporan</p>
        </Box>
      )}
    </div>
  )
}
