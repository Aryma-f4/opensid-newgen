"use client"

import { useState, useCallback } from "react"
import { Box, LteTable, Th, Td, Btn, ContentHeader, StatusLabel } from "@/components/admin/Ui"
import { scanThemes, activateTheme, deleteTheme } from "./actions"
import type { ThemeItem } from "./actions"

export default function Manager({ initial }: { initial: ThemeItem[] }) {
  const [items, setItems] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState<number | null>(null)

  const handleScan = useCallback(async () => {
    setLoading(true)
    try {
      const result = await scanThemes()
      setItems(result)
    } catch (err: any) {
      alert(err.message || "Gagal memindai direktori tema")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleActivate = useCallback(async (id: number) => {
    setActivating(id)
    try {
      const res = await activateTheme(id)
      if (res.success) {
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            status: item.id === id ? 1 : 0,
          }))
        )
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan tema")
    } finally {
      setActivating(null)
    }
  }, [])

  const handleDelete = useCallback(async (id: number, nama: string) => {
    if (!confirm(`Hapus tema "${nama}" dari database?`)) return
    try {
      const res = await deleteTheme(id)
      if (res.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, id: null, status: 0, diDb: false }
              : item
          )
        )
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus tema")
    }
  }, [])

  return (
    <div>
      <ContentHeader
        title="Pindai Tema"
        breadcrumb={[{ label: "Website" }, { label: "Pindai Tema" }]}
      />

      <Box
        title={`Tema Tersedia (${items.length})`}
        tools={
          <Btn color="primary" onClick={handleScan} disabled={loading}>
            <i className="fa fa-refresh" />{" "}
            {loading ? "Memindai..." : "Scan Directory"}
          </Btn>
        }
        noPadding
      >
        <LteTable
          head={
            <>
              <Th className="w-8 text-center">No</Th>
              <Th>Nama Tema</Th>
              <Th>Folder</Th>
              <Th>Versi</Th>
              <Th>Status</Th>
              <Th>Sumber</Th>
              <Th className="text-center">Aksi</Th>
            </>
          }
        >
          {items.length === 0 ? (
            <tr>
              <Td
                colSpan={7}
                className="text-center py-8 text-gray-400"
              >
                Tidak ada tema ditemukan
              </Td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id ?? `disk-${item.path}`}>
                <Td className="text-center text-gray-500">{index + 1}</Td>
                <Td>
                  <span className="font-medium">{item.nama}</span>
                  {item.keterangan && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.keterangan}
                    </p>
                  )}
                </Td>
                <Td className="font-mono text-sm">{item.path}</Td>
                <Td>{item.versi ?? "-"}</Td>
                <Td>
                  {item.diDb ? (
                    <StatusLabel ok={item.status === 1} yes="Aktif" no="Non-aktif" />
                  ) : (
                    <span className="label label-warning">Belum terinstal</span>
                  )}
                </Td>
                <Td>
                  {item.diDb && item.diDisk ? (
                    <span className="label label-success">DB & Disk</span>
                  ) : item.diDb && !item.diDisk ? (
                    <span className="label label-danger">DB saja (folder hilang)</span>
                  ) : (
                    <span className="label label-info">Disk saja</span>
                  )}
                </Td>
                <Td className="text-center whitespace-nowrap">
                  {item.diDb ? (
                    <>
                      <Btn
                        color={item.status === 1 ? "default" : "success"}
                        size="xs"
                        disabled={item.status === 1 || activating === item.id}
                        onClick={() => item.id && handleActivate(item.id)}
                      >
                        {activating === item.id
                          ? "..."
                          : item.status === 1
                            ? "Aktif"
                            : "Aktifkan"}
                      </Btn>{" "}
                      <Btn
                        color="danger"
                        size="xs"
                        onClick={() =>
                          item.id && handleDelete(item.id, item.nama)
                        }
                      >
                        <i className="fa fa-trash" />
                      </Btn>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
