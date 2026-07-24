import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function LapakPage() {
  const rows = await prisma.pelapak.findMany({
    orderBy: { id: "desc" },
    include: {
      tweb_penduduk: { select: { id: true, nama: true, nik: true } },
      produk: { select: { id: true } },
    },
  })
  return (
    <div>
      <ContentHeader title="Lapak" breadcrumb={[{ label: "Lapak" }, { label: "Pelapak" }]} />
      <Box title={`Daftar Pelapak (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama</Th><Th>NIK</Th><Th>Telepon</Th><Th>Produk</Th><Th>Lokasi</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.tweb_penduduk ? <Link href={`/penduduk/${row.tweb_penduduk.id}`}>{row.tweb_penduduk.nama}</Link> : "-"}</Td>
              <Td>{row.tweb_penduduk?.nik ?? "-"}</Td>
              <Td>{row.telepon ?? "-"}</Td>
              <Td>{row.produk.length}</Td>
              <Td>{row.lat && row.lng ? `${row.lat}, ${row.lng}` : "-"}</Td>
              <Td><StatusLabel ok={row.status} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
