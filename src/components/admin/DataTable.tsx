"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { exportToCsv, exportToExcel, printTable } from "./ExportUtils"

export type Column<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

export type RowAction<T> = {
  label: string
  href?: (row: T) => string
  onClick?: (row: T) => void | Promise<void>
  className?: string
  icon?: string
  confirm?: string
  show?: (row: T) => boolean
}

export type BulkAction = {
  label: string
  onClick: (ids: (string | number)[]) => void | Promise<void>
  confirm?: string
  className?: string
}

export type ImportConfig = {
  model: string
  columns: { key: string; label: string }[]
}

type Props<T> = {
  endpoint: string
  columns: Column<T>[]
  rowKey: (row: T) => string | number
  rowActions?: RowAction<T>[]
  bulkActions?: BulkAction[]
  pageSize?: number
  initialSearch?: string
  emptyMessage?: string
  extraParams?: Record<string, string | number | undefined>
  exportTitle?: string
  importConfig?: ImportConfig
}

export default function DataTable<T extends Record<string, any>>({
  endpoint,
  columns,
  rowKey,
  rowActions = [],
  bulkActions = [],
  pageSize = 20,
  initialSearch = "",
  emptyMessage = "Tidak ada data.",
  extraParams = {},
  exportTitle,
  importConfig,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; errors: number; messages: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const params = new URLSearchParams({
    page: String(page),
    perPage: String(pageSize),
    ...(search ? { q: search } : {}),
    ...Object.fromEntries(
      Object.entries(extraParams)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)])
    ),
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${endpoint}?${params}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setRows(data.data ?? data)
      setTotal(data.total ?? data.length)
    } catch (e: any) {
      setError(e.message ?? "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [endpoint, params.toString()])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1); setSelected(new Set()) }, [search, JSON.stringify(extraParams)])

  const pages = Math.max(1, Math.ceil(total / pageSize))
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(rowKey(r)))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(rows.map(rowKey)))
  }
  function toggleOne(id: string | number) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  async function runBulk(action: BulkAction) {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    if (action.confirm && !confirm(action.confirm.replace("%n", String(ids.length)))) return
    await action.onClick(ids)
    setSelected(new Set())
    load()
  }

  async function runRowAction(action: RowAction<T>, row: T) {
    if (action.confirm && !confirm(action.confirm)) return
    if (action.onClick) await action.onClick(row)
    load()
  }

  async function handleImport() {
    if (!importFile || !importConfig) return
    setImporting(true)
    setImportResult(null)
    try {
      const fd = new FormData()
      fd.append("file", importFile)
      fd.append("model", importConfig.model)
      fd.append("columns", JSON.stringify(importConfig.columns))
      const res = await fetch("/api/import", { method: "POST", body: fd })
      const result = await res.json()
      setImportResult(result)
      if (result.imported > 0) load()
    } catch (e: any) {
      setImportResult({ imported: 0, errors: 1, messages: [e.message] })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari..."
          className="border rounded px-3 py-1.5 text-sm flex-1 max-w-xs"
        />
        {bulkActions.length > 0 && selected.size > 0 && (
          <span className="text-sm text-gray-500">{selected.size} dipilih</span>
        )}
        {bulkActions.map((a) => (
          <button
            key={a.label}
            onClick={() => runBulk(a)}
            disabled={selected.size === 0}
            className={`px-3 py-1.5 rounded text-sm border disabled:opacity-50 hover:bg-gray-50 ${a.className ?? ""}`}
          >
            {a.label}
          </button>
        ))}
        <button onClick={load} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50">
          <i className="fa fa-refresh" /> Muat ulang
        </button>
        {rows.length > 0 && columns.length > 0 && (
          <span className="flex gap-1">
            <button
              onClick={() => exportToCsv(rows, columns as any)}
              className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 text-green-700 border-green-300"
              title="Export CSV"
            >
              <i className="fa fa-file-excel-o" /> CSV
            </button>
            <button
              onClick={() => exportToExcel(rows, columns as any, exportTitle || "Data")}
              className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 text-green-600 border-green-300"
              title="Export Excel"
            >
              <i className="fa fa-file-excel-o" /> Excel
            </button>
            <button
              onClick={() => printTable(rows, columns as any, exportTitle || "Data")}
              className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 text-blue-600 border-blue-300"
              title="Cetak"
            >
              <i className="fa fa-print" /> Cetak
            </button>
            {importConfig && (
              <button
                onClick={() => { setImportOpen(true); setImportFile(null); setImportResult(null) }}
                className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 text-purple-700 border-purple-300"
                title="Import Excel/CSV"
              >
                <i className="fa fa-upload" /> Import
              </button>
            )}
          </span>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-3">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {bulkActions.length > 0 && (
                <th className="p-2 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
              )}
              {columns.map((c) => (
                <th key={String(c.key)} className={`text-left p-2 ${c.className ?? ""}`}>{c.label}</th>
              ))}
              {rowActions.length > 0 && <th className="text-left p-2">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + 2} className="p-8 text-center text-gray-400">Memuat...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="p-8 text-center text-gray-400">{emptyMessage}</td></tr>
            ) : (
              rows.map((row) => {
                const id = rowKey(row)
                const sel = selected.has(id)
                return (
                  <tr key={id} className={`border-t hover:bg-gray-50 ${sel ? "bg-blue-50" : ""}`}>
                    {bulkActions.length > 0 && (
                      <td className="p-2"><input type="checkbox" checked={sel} onChange={() => toggleOne(id)} /></td>
                    )}
                    {columns.map((c) => (
                      <td key={String(c.key)} className={`p-2 ${c.className ?? ""}`}>
                        {c.render ? c.render(row) : String(row[c.key as string] ?? "")}
                      </td>
                    ))}
                    {rowActions.length > 0 && (
                      <td className="p-2 whitespace-nowrap">
                        {rowActions.filter((a) => !a.show || a.show(row)).map((a, i) => (
                          <span key={i}>
                            {a.href ? (
                              <a href={a.href!(row)} className={`text-sm hover:underline mr-2 ${a.className ?? "text-blue-600"}`}>
                                {a.icon && <i className={`fa ${a.icon} mr-1`} />}{a.label}
                              </a>
                            ) : (
                              <button
                                onClick={() => runRowAction(a, row)}
                                className={`text-sm hover:underline mr-2 ${a.className ?? "text-blue-600"}`}
                              >
                                {a.icon && <i className={`fa ${a.icon} mr-1`} />}{a.label}
                              </button>
                            )}
                          </span>
                        ))}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">&larr;</button>
          {Array.from({ length: Math.min(10, pages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 5, pages - 9))
            const p = start + i
            if (p > pages) return null
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded text-sm ${p === page ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}
              >
                {p}
              </button>
            )
          })}
          <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">&rarr;</button>
          <span className="text-sm text-gray-500 self-center ml-2">{total} total</span>
        </div>
      )}
      {/* Import Modal */}
      {importOpen && importConfig && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setImportOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Import Data</h3>
              <button onClick={() => setImportOpen(false)} className="text-gray-400 hover:text-gray-700"><i className="fa fa-times" /></button>
            </div>
            <div className="p-6 space-y-4">
              {importResult ? (
                <div>
                  <div className={`text-sm p-3 rounded ${importResult.errors === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                    <p><strong>Berhasil:</strong> {importResult.imported} baris</p>
                    <p><strong>Gagal:</strong> {importResult.errors} baris</p>
                  </div>
                  {importResult.messages.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs text-gray-600 bg-gray-50 rounded p-2">
                      {importResult.messages.map((m, i) => <p key={i}>{m}</p>)}
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <button onClick={() => { setImportOpen(false); setImportResult(null) }} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Tutup</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Pilih file Excel atau CSV untuk diimport. File harus memiliki header yang sesuai dengan kolom data.</p>
                  <div>
                    <label className="block text-sm font-medium mb-1">File (.xlsx, .csv)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button onClick={() => setImportOpen(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Batal</button>
                    <button
                      onClick={handleImport}
                      disabled={!importFile || importing}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {importing ? "Mengimport..." : "Import"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}