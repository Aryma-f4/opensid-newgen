"use client"

import { useState, useEffect } from "react"
import { ContentHeader, Box, Btn } from "@/components/admin/Ui"

type IndikatorStat = {
  id: number
  nomor: string | null
  pertanyaan: string
  bobot: number
  id_tipe: number | null
  is_teks: boolean
  is_publik: boolean
  kategori: string
  parameter: { id: number; jawaban: string; nilai: number; kode_jawaban: number | null }[]
  respon: { id_parameter: number; jawaban: string; nilai: number; jumlah: number; persen: number }[]
  total_jawaban: number
}

type StatResponse = {
  indikators: IndikatorStat[]
  periode: { id: number; nama: string }[]
  total_responden: number
  total_indikator: number
}

export default function Manager({
  masterList,
}: {
  masterList: { id: number; nama: string }[]
}) {
  const [idMaster, setIdMaster] = useState("")
  const [idPeriode, setIdPeriode] = useState("")
  const [idIndikator, setIdIndikator] = useState("")
  const [data, setData] = useState<StatResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!idMaster) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ id_master: idMaster })
      if (idPeriode) params.set("id_periode", idPeriode)
      if (idIndikator) params.set("id_indikator", idIndikator)
      const res = await fetch(`/api/analisis/statistik?${params}`)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      const result = await res.json()
      setData(result)
    } catch (e: any) {
      setError(e.message ?? "Gagal memuat statistik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (idMaster) loadData()
  }, [])

  const chartColors = ["#3c8dbc", "#00a65a", "#f39c12", "#dd4b39", "#932ab6", "#00c0ef", "#605ca8", "#ff851b"]

  return (
    <div>
      <ContentHeader title="Statistik Jawaban" breadcrumb={[{ label: "Analisis" }, { label: "Statistik" }]} />

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
              {data?.periode.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[250px]">
            <label className="block text-xs text-gray-500 mb-1">Indikator</label>
            <select
              value={idIndikator}
              onChange={(e) => setIdIndikator(e.target.value)}
              className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            >
              <option value="">Semua Indikator</option>
              {data?.indikators.map((ind) => (
                <option key={ind.id} value={ind.id}>{ind.nomor ?? ""}. {ind.pertanyaan}</option>
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
        <div className="text-center text-gray-400 py-8">Memuat statistik...</div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          <Box>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Total Responden:</span>
                <span className="font-bold ml-1">{data.total_responden}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Indikator:</span>
                <span className="font-bold ml-1">{data.total_indikator}</span>
              </div>
            </div>
          </Box>

          {data.indikators.map((ind) => (
            <Box key={ind.id} title={`${ind.nomor ?? ""}. ${ind.pertanyaan}`} noPadding>
              <div className="p-3 text-sm">
                <div className="flex gap-4 text-gray-500 mb-2">
                  <span>Kategori: {ind.kategori}</span>
                  <span>Bobot: {ind.bobot}</span>
                  <span>Total: {ind.total_jawaban}</span>
                </div>

                {/* Chart bar */}
                <div className="space-y-2 mb-4">
                  {ind.respon.map((r, i) => (
                    <div key={r.id_parameter}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{r.jawaban}</span>
                        <span>{r.jumlah} ({r.persen}%)</span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                          style={{
                            width: `${Math.max(r.persen, 2)}%`,
                            backgroundColor: chartColors[i % chartColors.length],
                          }}
                        >
                          {r.persen > 10 && `${r.persen}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover text-sm">
                    <thead>
                      <tr>
                        <th>Jawaban</th>
                        <th className="text-center">Nilai</th>
                        <th className="text-center">Jumlah</th>
                        <th className="text-center">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ind.respon.length > 0 ? (
                        ind.respon.map((r) => (
                          <tr key={r.id_parameter}>
                            <td className="font-medium">{r.jawaban}</td>
                            <td className="text-center">{r.nilai}</td>
                            <td className="text-center">{r.jumlah}</td>
                            <td className="text-center">{r.persen}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="text-center text-gray-400">Belum ada jawaban</td></tr>
                      )}
                      {ind.total_jawaban > 0 && (
                        <tr className="bg-gray-100 font-semibold">
                          <td>Total</td>
                          <td></td>
                          <td className="text-center">{ind.total_jawaban}</td>
                          <td className="text-center">100%</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Box>
          ))}
        </div>
      )}

      {!idMaster && !loading && (
        <Box>
          <p className="text-center text-gray-400 py-4">Pilih survey untuk melihat statistik</p>
        </Box>
      )}
    </div>
  )
}
