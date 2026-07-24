"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { ContentHeader, Box, LteTable, Th, Td, Btn, Paging, StatusLabel } from "@/components/admin/Ui"
import { createPenduduk, updatePenduduk, deletePenduduk, importPenduduk } from "./actions"

type Penduduk = {
  id: number
  nik: string
  nama: string
  sex: number
  tempatlahir: string | null
  tanggallahir: Date | null
  agama_id: number | null
  alamat_sekarang: string | null
  id_cluster: number | null
  status_dasar: number
}

type RefMap = Record<string, { id: number; nama: string }[]>

const emptyForm = {
  nik: "", nama: "", sex: 1, tempatlahir: "", tanggallahir: "",
  agama_id: "", pendidikan_kk_id: "", pekerjaan_id: "", status_kawin: "",
  warganegara_id: "", id_cluster: "", alamat_sekarang: "", telepon: "",
}

export default function PendudukManager({
  penduduk, sexRef, agamaRef, pekerjaanRef, kawinRef, pendidikanRef,
  wargaRef, clusterRef, total, page, pages, q, sex, dusun, statusDasar,
  tglFrom, tglTo, dusunList,
}: {
  penduduk: Penduduk[]
  sexRef: any[]; agamaRef: any[]; pekerjaanRef: any[]; kawinRef: any[]
  pendidikanRef: any[]; wargaRef: any[]; clusterRef: any[]
  total: number; page: number; pages: number; q: string; sex?: number
  dusun?: string; statusDasar?: number; tglFrom?: string; tglTo?: string
  dusunList?: string[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: number; messages: string[] } | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  const sexMap = new Map(sexRef.map((s) => [s.id, s.nama]))
  const agamaMap = new Map(agamaRef.map((a) => [a.id, a.nama]))
  const clusterMap = new Map(clusterRef.map((c) => [c.id, c.dusun]))
  const selectedIds = Array.from(pendingIds)

  const toggleSelect = (id: number) => {
    setPendingIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updatePenduduk(editing, form)
      } else {
        await createPenduduk(form)
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} penduduk?`)) return
    try {
      await deletePenduduk(ids)
      setPendingIds(new Set())
    } catch (err: any) {
      alert(err.message || "Gagal menghapus")
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const fd = new FormData()
      fd.append("file", importFile)
      const result = await importPenduduk(fd)
      setImportResult(result)
    } catch (err: any) {
      setImportResult({ imported: 0, errors: 1, messages: [err.message] })
    } finally {
      setImporting(false)
    }
  }

  const openEdit = (p: any) => {
    setForm({
      nik: p.nik ?? "",
      nama: p.nama ?? "",
      sex: p.sex ?? 1,
      tempatlahir: p.tempatlahir ?? "",
      tanggallahir: p.tanggallahir ? new Date(p.tanggallahir).toISOString().split("T")[0] : "",
      agama_id: String(p.agama_id ?? ""),
      pendidikan_kk_id: String(p.pendidikan_kk_id ?? ""),
      pekerjaan_id: String(p.pekerjaan_id ?? ""),
      status_kawin: String(p.status_kawin ?? ""),
      warganegara_id: String(p.warganegara_id ?? ""),
      id_cluster: String(p.id_cluster ?? ""),
      alamat_sekarang: p.alamat_sekarang ?? "",
      telepon: p.telepon ?? "",
    })
    setEditing(p.id)
    setShowForm(true)
  }

  const Select = ({ name, label, options, value, onChange }: any) => (
    <div className="min-w-[180px] flex-1">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
      >
        <option value="">-- Pilih --</option>
        {options.map((o: any) => (
          <option key={o.id} value={o.id}>{o.nama}</option>
        ))}
      </select>
    </div>
  )

  return (
    <div>
      <ContentHeader title="Penduduk" subtitle="Daftar Penduduk" breadcrumb={[{ label: "Kependudukan" }, { label: "Penduduk" }]} />

      <Box title={`Daftar Penduduk (${total.toLocaleString("id-ID")})`} noPadding>
        <div className="p-3 flex flex-wrap gap-2 items-center border-b border-[#f4f4f4]">
          <form className="flex flex-wrap gap-2 flex-1" method="GET" action="">
            <input name="q" defaultValue={q} placeholder="Cari nama atau NIK..." className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs focus:border-lte-primary focus:outline-none" />
            <select name="sex" defaultValue={sex ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua JK</option>
              {sexRef.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
            {dusunList && dusunList.length > 0 && (
              <select name="dusun" defaultValue={dusun ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
                <option value="">Semua Dusun</option>
                {dusunList.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <select name="status_dasar" defaultValue={statusDasar ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Status</option>
              <option value="1">Hidup</option>
              <option value="2">Mati</option>
            </select>
            <input name="tgl_from" type="date" defaultValue={tglFrom ?? ""} placeholder="Dari" className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
            <input name="tgl_to" type="date" defaultValue={tglTo ?? ""} placeholder="Sampai" className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
            <Btn type="submit" color="primary"><i className="fa fa-search" /> Cari</Btn>
            {(q || sex || dusun || statusDasar || tglFrom || tglTo) && (
              <Link href="/penduduk" className="text-gray-500 self-center text-sm hover:underline">Reset</Link>
            )}
          </form>
          <Btn color="success" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true) }}>
            <i className="fa fa-plus" /> Tambah Penduduk
          </Btn>
          <Btn color="info" onClick={() => { setShowImport(true); setImportFile(null); setImportResult(null) }}>
            <i className="fa fa-upload" /> Import
          </Btn>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}>
              <i className="fa fa-trash" /> Hapus
            </Btn>
          </div>
        )}

        <LteTable head={<><Th className="w-10"><input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(penduduk.map(p => p.id))) }} /></Th><Th>NIK</Th><Th>Nama</Th><Th>L/P</Th><Th>Tgl Lahir</Th><Th>Agama</Th><Th>Dusun</Th><Th>Aksi</Th></>}>
          {penduduk.length === 0 ? (
            <tr><Td colSpan={8} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>
          ) : penduduk.map((p) => (
            <tr key={p.id}>
              <Td className="text-center"><input type="checkbox" checked={pendingIds.has(p.id)} onChange={() => toggleSelect(p.id)} /></Td>
              <Td className="font-mono max-w-32 truncate">{p.nik}</Td>
              <Td><Link href={`/penduduk/${p.id}`} className="text-lte-primary hover:underline">{p.nama}</Link></Td>
              <Td>{sexMap.get(p.sex) ?? "-"}</Td>
              <Td>{p.tempatlahir}, {p.tanggallahir?.toLocaleDateString("id-ID") ?? "-"}</Td>
              <Td>{agamaMap.get(p.agama_id ?? 0) ?? "-"}</Td>
              <Td>{clusterMap.get(p.id_cluster ?? 0) ?? "-"}</Td>
              <Td className="whitespace-nowrap">
                <Btn color="primary" size="xs" onClick={() => openEdit(p)}><i className="fa fa-pencil" /> Edit</Btn>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([p.id])}><i className="fa fa-trash" /> Hapus</Btn>
              </Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <Paging base="/penduduk" page={page} pages={pages} q={q} extraParams={{ sex: sex ? String(sex) : undefined, dusun, status_dasar: statusDasar ? String(statusDasar) : undefined, tgl_from: tglFrom, tgl_to: tglTo } as any} />

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Import Penduduk dari CSV</h2>
              <button type="button" onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {importResult ? (
                <div>
                  <div className={`text-sm p-3 rounded ${importResult.errors === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                    <p className="font-medium">Hasil Import:</p>
                    <p>Berhasil: {importResult.imported} baris</p>
                    <p>Gagal: {importResult.errors} baris</p>
                  </div>
                  {importResult.messages.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs text-gray-600 bg-gray-50 rounded p-2">
                      {importResult.messages.slice(0, 50).map((m, i) => <p key={i}>{m}</p>)}
                      {importResult.messages.length > 50 && <p className="text-gray-400 mt-1">...dan {importResult.messages.length - 50} pesan lainnya</p>}
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <Btn color="default" onClick={() => { setShowImport(false); setImportResult(null) }}>Tutup</Btn>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Pilih file CSV dengan header pada baris pertama. Format kolom:
                    NIK, Nama, Jenis Kelamin (1=Laki/2=Perempuan), Tempat Lahir, Tgl Lahir, Agama, Pendidikan, Pekerjaan, Status Kawin, Warganegara, Alamat, Telepon
                  </p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">File CSV</label>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Btn type="button" color="default" onClick={() => setShowImport(false)}>Batal</Btn>
                    <Btn
                      type="button"
                      color="success"
                      disabled={!importFile || importing}
                      onClick={handleImport}
                    >
                      {importing ? "Mengimport..." : "Import"}
                    </Btn>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 mb-12" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Edit Penduduk" : "Tambah Penduduk"}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="col-span-full">
                    <label className="block text-xs text-gray-500 mb-1">NIK <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} required maxLength={16} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm font-mono" />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-xs text-gray-500 mb-1">Nama <span className="text-red-500">*</span></label>
                    <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <Select name="sex" label="Jenis Kelamin *" options={sexRef} value={form.sex.toString()} />
                  <Select name="agama_id" label="Agama" options={agamaRef} value={form.agama_id} />
                  <Select name="pendidikan_kk_id" label="Pendidikan" options={pendidikanRef} value={form.pendidikan_kk_id} />
                  <Select name="pekerjaan_id" label="Pekerjaan" options={pekerjaanRef} value={form.pekerjaan_id} />
                  <Select name="status_kawin" label="Status Kawin" options={kawinRef} value={form.status_kawin} />
                  <Select name="warganegara_id" label="Kewarganegaraan" options={wargaRef} value={form.warganegara_id} />
                  <Select name="id_cluster" label="Dusun" options={clusterRef.map((c: any) => ({ id: c.id, nama: c.dusun })).filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.nama === v.nama) === i)} value={form.id_cluster} />
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tempat Lahir</label>
                    <input type="text" value={form.tempatlahir} onChange={(e) => setForm({ ...form, tempatlahir: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tanggal Lahir</label>
                    <input type="date" value={form.tanggallahir} onChange={(e) => setForm({ ...form, tanggallahir: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-xs text-gray-500 mb-1">Alamat</label>
                    <input type="text" value={form.alamat_sekarang} onChange={(e) => setForm({ ...form, alamat_sekarang: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Telepon</label>
                    <input type="text" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} className="w-full border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <Btn type="button" color="default" onClick={() => setShowForm(false)}>Batal</Btn>
                <Btn type="submit" color="success" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
