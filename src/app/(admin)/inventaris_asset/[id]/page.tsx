import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function InventarisAssetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.inventaris_asset.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Nama Barang", item.nama_barang],
    ["Kode Barang", item.kode_barang],
    ["Register", item.register],
    ["Jenis", item.jenis],
    ["Jumlah", String(item.jumlah)],
    ["Tahun Pengadaan", String(item.tahun_pengadaan)],
    ["Asal", item.asal],
    ["Harga", `Rp ${item.harga.toLocaleString("id-ID")}`],
    ["Keterangan", item.keterangan],
    ["Judul Buku", item.judul_buku ?? "-"],
    ["Spesifikasi Buku", item.spesifikasi_buku ?? "-"],
    ["Asal Daerah", item.asal_daerah ?? "-"],
    ["Pencipta", item.pencipta ?? "-"],
    ["Bahan", item.bahan ?? "-"],
    ["Jenis Hewan", item.jenis_hewan ?? "-"],
    ["Ukuran Hewan", item.ukuran_hewan ?? "-"],
    ["Jenis Tumbuhan", item.jenis_tumbuhan ?? "-"],
    ["Ukuran Tumbuhan", item.ukuran_tumbuhan ?? "-"],
    ["Status", <StatusLabel key="st" ok={item.visible === 1} yes="Aktif" no="Tidak Aktif" />],
    ["Dibuat", item.created_at?.toLocaleString("id-ID") ?? "-"],
    ["Diubah", item.updated_at?.toLocaleString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Inventaris Asset" breadcrumb={[{ label: "Inventaris Asset", href: "/inventaris_asset" }, { label: item.nama_barang }]} />

      <Box title={item.nama_barang} color="primary" noPadding>
        <LteTable head={<><Th>Field</Th><Th>Nilai</Th></>}>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <Td className="w-56 text-gray-500">{label}</Td>
              <Td>{value}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <div className="mt-3 flex gap-2">
        <Link href="/inventaris_asset" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
