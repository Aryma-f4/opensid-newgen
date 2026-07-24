"use client"

import { useEffect, useState, use } from "react"

export default function CetakSuratPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [html, setHtml] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/surat/cetak/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Surat tidak ditemukan")
        const text = await res.text()
        setHtml(text)
        setLoading(false)
        // Auto-trigger print after a brief delay for rendering
        setTimeout(() => window.print(), 500)
      })
      .catch((e) => {
        setError(e.message || "Gagal memuat surat")
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat surat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl text-red-400 mb-4">!</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-gray-800 text-white px-4 py-2 flex items-center justify-between no-print print:hidden">
        <span className="text-sm">Cetak Surat</span>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm"
          >
            <i className="fa fa-print mr-1" /> Cetak
          </button>
          <button
            onClick={() => window.close()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
