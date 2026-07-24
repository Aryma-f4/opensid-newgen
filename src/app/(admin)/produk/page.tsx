import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function ProdukPage() {
  const rows = await prisma.produk.findMany({
    orderBy: { id: "desc" },
    include: {
      produk_kategori: { select: { kategori: true } },
      pelapak: { include: { tweb_penduduk: { select: { nama: true } } } },
    },
  })
  return (
    <div>
      <ContentHeader title="Produk" breadcrumb={[{ label: "Lapak" }, { label: "Produk" }]} />
      <Box title={`Daftar Produk (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama Produk</Th><Th>Kategori</Th><Th>Pelapak</Th><Th>Harga</Th><Th>Satuan</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.nama ?? "-"}</Td>
              <Td>{row.produk_kategori?.kategori ?? "-"}</Td>
              <Td>{row.pelapak?.tweb_penduduk?.nama ?? "-"}</Td>
              <Td>{(row.harga ?? 0).toLocaleString("id-ID")}</Td>
              <Td>{row.satuan ?? "-"}</Td>
              <Td><StatusLabel ok={row.status} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
