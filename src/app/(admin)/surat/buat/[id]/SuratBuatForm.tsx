"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Box, Btn } from "@/components/admin/Ui"

type Penduduk = {
  id: number
  nik: string
  nama: string
  sex: number
  tempatlahir: string | null
  tanggallahir: string | null
  alamat_sekarang: string | null
}

type SuratFormat = {
  id: number
  nama: string
  kode_surat: string | null
  url_surat: string
  form_isian: string | null
  template: string | null
  orientasi: string | null
  ukuran: string | null
}

type IsianField = {
  label: string
  id: string
  type?: string
  required?: boolean
}

export default function SuratBuatForm({
  format,
  isianFields,
}: {
  format: SuratFormat
  isianFields: IsianField[]
}) {
  const router = useRouter()
  const [step, setStep] = useState<"penduduk" | "isian" | "preview">("penduduk")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Penduduk[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPenduduk, setSelectedPenduduk] = useState<Penduduk | null>(null)
  const [isianData, setIsianData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [logId, setLogId] = useState<number | null>(null)
  const [noSurat, setNoSurat] = useState("")
  const [namaPamong, setNamaPamong] = useState("")
  const [jabatanPamong, setJabatanPamong] = useState("")
  const [error, setError] = useState("")

  // Search penduduk with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/penduduk/search?q=${encodeURIComponent(searchQuery)}`)
        const json = await res.json()
        setSearchResults(json.data || [])
      } catch (e) {
        console.error("Search error", e)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handlePilihPenduduk = (p: Penduduk) => {
    setSelectedPenduduk(p)
    setStep("isian")
    setSearchQuery("")
  }

  const handleIsianChange = (id: string, value: string) => {
    setIsianData((prev) => ({ ...prev, [id]: value }))
  }

  const handlePreview = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/surat/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_format_surat: format.id,
          id_pend: selectedPenduduk?.id,
          no_surat: noSurat,
          nama_pamong: namaPamong,
          nip_pamong: "",
          isian: isianData,
        }),
      })
      if (!res.ok) throw new Error("Gagal memuat preview")
      const html = await res.text()
      setPreviewHtml(html)
      setShowPreviewModal(true)
    } catch (e: any) {
      setError(e.message || "Gagal memuat preview")
    } finally {
      setSaving(false)
    }
  }

  const handleSimpanKonsep = async () => {
    setSaving(true)
    setError("")
    try {
      // Expand isian data to include penduduk and pamong info
      const expandedIsian = {
        ...isianData,
        _penduduk: selectedPenduduk
          ? {
              id: selectedPenduduk.id,
              nik: selectedPenduduk.nik,
              nama: selectedPenduduk.nama,
            }
          : null,
        _pamong: {
          nama: namaPamong,
          jabatan: jabatanPamong,
        },
      }

      const body: any = {
        id_format_surat: format.id,
        id_pend: selectedPenduduk?.id || null,
        nama_surat: format.nama,
        id_pamong: null,
        nama_pamong: namaPamong || null,
        nama_jabatan: jabatanPamong || null,
        pemohon: selectedPenduduk?.nama || null,
        status: 0, // draft/konsep
        isi_surat_temp: JSON.stringify(expandedIsian),
        no_surat: noSurat || null,
      }

      if (logId) {
        await fetch(`/api/surat/log/${logId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        const res = await fetch("/api/surat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Gagal menyimpan")
        }
        const created = await res.json()
        setLogId(created.id)
      }

      router.push("/surat/konsep")
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan konsep")
    } finally {
      setSaving(false)
    }
  }

  const handleCetak = async () => {
    if (!logId) {
      // Save first
      setSaving(true)
      setError("")
      try {
        const expandedIsian = {
          ...isianData,
          _penduduk: selectedPenduduk
            ? { id: selectedPenduduk.id, nik: selectedPenduduk.nik, nama: selectedPenduduk.nama }
            : null,
          _pamong: { nama: namaPamong, jabatan: jabatanPamong },
        }

        const body: any = {
          id_format_surat: format.id,
          id_pend: selectedPenduduk?.id || null,
          nama_surat: format.nama,
          nama_pamong: namaPamong || null,
          nama_jabatan: jabatanPamong || null,
          pemohon: selectedPenduduk?.nama || null,
          status: 1, // cetak
          isi_surat: JSON.stringify(expandedIsian),
          no_surat: noSurat || null,
        }

        const res = await fetch("/api/surat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const created = await res.json()
        setLogId(created.id)
        window.open(`/surat/cetak/${created.id}`, "_blank")
      } catch (e: any) {
        setError(e.message || "Gagal mencetak")
      } finally {
        setSaving(false)
      }
    } else {
      // Update existing to cetak status
      await fetch(`/api/surat/log/${logId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1, isi_surat: JSON.stringify({ ...isianData }) }),
      })
      window.open(`/surat/cetak/${logId}`, "_blank")
    }
  }

  const resetForm = () => {
    setSelectedPenduduk(null)
    setIsianData({})
    setLogId(null)
    setNoSurat("")
    setNamaPamong("")
    setJabatanPamong("")
    setStep("penduduk")
    setError("")
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex gap-1 mb-4 text-sm">
        {[
          { key: "penduduk", label: "1. Pilih Penduduk" },
          { key: "isian", label: "2. Isi Data Surat" },
          { key: "preview", label: "3. Preview & Cetak" },
        ].map((s, i) => (
          <div
            key={s.key}
            className={`px-4 py-2 rounded-t ${
              step === s.key
                ? "bg-lte-primary text-white font-bold"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible text-sm">
          <button type="button" className="close" onClick={() => setError("")}>&times;</button>
          {error}
        </div>
      )}

      {/* Step 1: Pilih Penduduk */}
      {step === "penduduk" && (
        <Box title="Pilih Penduduk" color="primary">
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Cari NIK atau Nama</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik minimal 2 karakter..."
              className="w-full max-w-md border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
              autoFocus
            />
          </div>

          {searching && <div className="text-sm text-gray-500 mb-2">Mencari...</div>}

          {searchResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Tempat/Tgl Lahir</th>
                    <th>Alamat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono">{p.nik}</td>
                      <td>{p.nama}</td>
                      <td>{p.sex === 1 ? "L" : "P"}</td>
                      <td>
                        {p.tempatlahir}
                        {p.tanggallahir ? `, ${new Date(p.tanggallahir).toLocaleDateString("id-ID")}` : ""}
                      </td>
                      <td>{p.alamat_sekarang || "-"}</td>
                      <td>
                        <Btn color="success" size="xs" onClick={() => handlePilihPenduduk(p)}>
                          <i className="fa fa-check" /> Pilih
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="text-sm text-gray-400 py-4 text-center">Tidak ada penduduk ditemukan</div>
          )}

          <div className="mt-3 flex justify-between">
            <Link href="/surat/pilih" className="btn btn-default btn-sm">
              <i className="fa fa-arrow-left" /> Kembali
            </Link>
            <Btn
              color="primary"
              disabled={!selectedPenduduk}
              onClick={() => setStep("isian")}
            >
              Lanjut <i className="fa fa-arrow-right" />
            </Btn>
          </div>
        </Box>
      )}

      {/* Step 2: Isi Data Surat */}
      {step === "isian" && (
        <Box title="Isi Data Surat" color="primary">
          {selectedPenduduk && (
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <div className="font-semibold text-sm mb-2">Penduduk Terpilih:</div>
              <div className="text-sm">
                {selectedPenduduk.nama} - {selectedPenduduk.nik}
              </div>
              <Btn color="warning" size="xs" className="mt-2" onClick={() => { setSelectedPenduduk(null); setStep("penduduk") }}>
                <i className="fa fa-exchange" /> Ganti Penduduk
              </Btn>
            </div>
          )}

          <div className="row">
            {/* Nomor Surat */}
            <div className="col-sm-6 form-group">
              <label className="block text-xs text-gray-500 mb-1">Nomor Surat</label>
              <input
                type="text"
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                placeholder="Contoh: 470/01/2024"
                className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
              />
            </div>

            {/* Nama Pamong (penandatangan) */}
            <div className="col-sm-6 form-group">
              <label className="block text-xs text-gray-500 mb-1">Penandatangan</label>
              <input
                type="text"
                value={namaPamong}
                onChange={(e) => setNamaPamong(e.target.value)}
                placeholder="Nama Kepala Desa / pejabat"
                className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
              />
            </div>

            {/* Jabatan Pamong */}
            <div className="col-sm-6 form-group">
              <label className="block text-xs text-gray-500 mb-1">Jabatan Penandatangan</label>
              <input
                type="text"
                value={jabatanPamong}
                onChange={(e) => setJabatanPamong(e.target.value)}
                placeholder="Contoh: Kepala Desa"
                className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Isian Fields */}
          {isianFields.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="font-semibold text-sm mb-3">Isian Data Surat:</div>
              <div className="row">
                {isianFields.map((field) => (
                  <div key={field.id || field.label} className="col-sm-6 form-group">
                    <label className="block text-xs text-gray-500 mb-1">
                      {field.label || field.id}
                      {field.required ? <span className="text-red-500">*</span> : ""}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={isianData[field.id || field.label] || ""}
                      onChange={(e) => handleIsianChange(field.id || field.label, e.target.value)}
                      className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-2 justify-between flex-wrap">
            <Btn color="default" onClick={() => setStep("penduduk")}>
              <i className="fa fa-arrow-left" /> Kembali
            </Btn>
            <div className="flex gap-2">
              <Btn color="info" onClick={handlePreview} disabled={saving}>
                <i className="fa fa-eye" /> {saving ? "Loading..." : "Preview"}
              </Btn>
              <Btn color="warning" onClick={handleSimpanKonsep} disabled={saving}>
                <i className="fa fa-save" /> Simpan Konsep
              </Btn>
              <Btn color="success" onClick={() => { setStep("preview") }}>
                <i className="fa fa-print" /> Lanjut ke Cetak <i className="fa fa-arrow-right" />
              </Btn>
            </div>
          </div>
        </Box>
      )}

      {/* Step 3: Preview & Cetak */}
      {step === "preview" && (
        <Box title="Preview & Cetak" color="success">
          <div className="mb-3 p-3 bg-info text-sm rounded text-white">
            <i className="fa fa-info-circle" /> Surat akan ditampilkan untuk dicetak. Gunakan shortcut <strong>Ctrl+P</strong> untuk mencetak.
          </div>

          <div className="border rounded overflow-hidden">
            <iframe
              srcDoc={previewHtml || "<p>Klik tombol Preview untuk melihat hasil surat</p>"}
              className="w-full"
              style={{ minHeight: 600, border: "none" }}
              title="Preview Surat"
            />
          </div>

          <div className="mt-3 flex gap-2 justify-between">
            <Btn color="default" onClick={() => setStep("isian")}>
              <i className="fa fa-arrow-left" /> Kembali ke Isian
            </Btn>
            <div className="flex gap-2">
              <Btn color="info" onClick={handlePreview} disabled={saving}>
                <i className="fa fa-refresh" /> Refresh Preview
              </Btn>
              <Btn color="success" onClick={handleCetak} disabled={saving}>
                <i className="fa fa-print" /> Cetak Surat
              </Btn>
            </div>
          </div>
        </Box>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-sm">Preview Surat</h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa fa-times" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={previewHtml}
                className="w-full"
                style={{ minHeight: "80vh", border: "none" }}
                title="Preview Surat"
              />
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <Btn color="default" onClick={() => setShowPreviewModal(false)}>
                Tutup
              </Btn>
              <Btn color="success" onClick={handleCetak} disabled={saving}>
                <i className="fa fa-print" /> Cetak
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
