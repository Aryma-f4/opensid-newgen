"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn, BtnLink, Paging, StatusLabel } from "@/components/admin/Ui"
import { deleteArtikel } from "./actions"

export default function WebClient({
  artikel,
  total,
  page,
  pages,
}: {
  artikel: any[]
  total: number
  page: number
  pages: number
}) {
  const router = useRouter()
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const selectedIds = Array.from(pendingIds)

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`Hapus ${ids.length} artikel?`)) return
    try {
      await deleteArtikel(ids)
      setPendingIds(new Set())
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Gagal menghapus")
    }
  }

  return (
    <div>
      <ContentHeader title="Artikel" breadcrumb={[{ label: "Web" }, { label: "Artikel" }]} />

      <Box
        title={`Daftar Artikel (${total.toLocaleString("id-ID")})`}
        tools={<BtnLink href="/web/tambah" color="primary"><i className="fa fa-plus" /> Tambah Artikel</BtnLink>}
        noPadding
      >
        {selectedIds.length > 0 && (
          <div className="p-3 border-b border-[#f4f4f4]">
            <span className="text-sm text-gray-500 mr-2">{selectedIds.length} dipilih</span>
            <Btn color="danger" size="xs" onClick={() => handleDelete(selectedIds)}>
              <i className="fa fa-trash" /> Hapus
            </Btn>
          </div>
        )}

        <LteTable
          head={
            <>
              <Th className="w-10">
                <input type="checkbox" checked={selectAll} onChange={() => { setSelectAll(!selectAll); setPendingIds(selectAll ? new Set() : new Set(artikel.map((a) => a.id))) }} />
              </Th>
              <Th>Judul</Th>
              <Th>Kategori</Th>
              <Th>Status</Th>
              <Th>Tanggal</Th>
              <Th>Dibaca</Th>
              <Th>Aksi</Th>
            </>
          }
        >
          {artikel.map((a) => (
            <tr key={a.id}>
              <Td className="text-center">
                <input type="checkbox" checked={pendingIds.has(a.id)} onChange={() => {
                  setPendingIds((prev) => {
                    const n = new Set(prev);
                    if (n.has(a.id)) n.delete(a.id); else n.add(a.id);
                    return n
                  })
                }} />
              </Td>
              <Td>{a.judul}</Td>
              <Td className="text-gray-500">{a.kategori?.kategori ?? "-"}</Td>
              <Td><StatusLabel ok={!!a.enabled} /></Td>
              <Td className="text-gray-500">{a.tgl_upload.toLocaleDateString("id-ID")}</Td>
              <Td className="text-gray-500">{a.hit ?? 0}</Td>
              <Td className="whitespace-nowrap">
                <BtnLink href={`/web/${a.id}`} color="primary" size="xs"><i className="fa fa-pencil" /> Edit</BtnLink>{" "}
                <Btn color="danger" size="xs" onClick={() => handleDelete([a.id])}><i className="fa fa-trash" /></Btn>
              </Td>
            </tr>
          ))}
          {artikel.length === 0 && (
            <tr><Td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>
          )}
        </LteTable>
      </Box>

      <Paging base="/web" page={page} pages={pages} />
    </div>
  )
}
