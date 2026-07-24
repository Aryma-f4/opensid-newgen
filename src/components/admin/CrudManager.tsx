"use client"

import { useState, useCallback } from "react"
import DataTable, { Column, RowAction, BulkAction, ImportConfig } from "./DataTable"
import FormModal, { Field } from "./FormModal"

type Props<T> = {
  title: string
  endpoint: string
  columns: Column<T>[]
  fields: Field<T>[]
  rowKey: (row: T) => string | number
  rowActions?: RowAction<T>[]
  bulkActions?: BulkAction[]
  extraRowActions?: RowAction<T>[]
  addLabel?: string
  extraParams?: Record<string, string | number | undefined>
  canAdd?: boolean
  exportTitle?: string
  importConfig?: ImportConfig
}

export default function CrudManager<T extends Record<string, any>>({
  title,
  endpoint,
  columns,
  fields,
  rowKey,
  rowActions = [],
  bulkActions = [],
  extraRowActions = [],
  addLabel = "+ Tambah",
  extraParams,
  canAdd = true,
  exportTitle,
  importConfig,
}: Props<T>) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  async function del(id: string | number) {
    if (!confirm("Hapus data ini?")) return
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" })
    if (!res.ok) { alert("Gagal: " + await res.text()); return }
    reload()
  }

  async function bulkDel(ids: (string | number)[]) {
    const res = await fetch(`${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) { alert("Gagal: " + await res.text()); return }
    reload()
  }

  const allRowActions: RowAction<T>[] = [
    {
      label: "Edit",
      icon: "fa-pencil",
      onClick: (row) => { setEditing(row); setShowForm(true) },
    },
    {
      label: "Hapus",
      icon: "fa-trash",
      className: "text-red-600",
      confirm: "Hapus data ini?",
      onClick: (row) => del(rowKey(row)),
    },
    ...rowActions,
    ...extraRowActions,
  ]

  const allBulk: BulkAction[] = [
    { label: "Hapus Terpilih", onClick: bulkDel, confirm: "Hapus %n data terpilih?", className: "text-red-600" },
    ...bulkActions,
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {canAdd && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            {addLabel}
          </button>
        )}
      </div>

      <div key={reloadKey}>
        <DataTable
          endpoint={endpoint}
          columns={columns}
          rowKey={rowKey}
          rowActions={allRowActions}
          bulkActions={allBulk}
          extraParams={extraParams}
          exportTitle={exportTitle || title}
          importConfig={importConfig}
        />
      </div>

      {showForm && (
        <FormModal<T>
          title={editing ? `Edit ${title}` : addLabel}
          fields={fields}
          initial={editing ?? {}}
          endpoint={endpoint}
          method={editing ? "PUT" : "POST"}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={reload}
        />
      )}
    </div>
  )
}