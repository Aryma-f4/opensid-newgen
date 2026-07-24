import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function InventarisPeralatanPage() {
  const rows = await prisma.inventaris_peralatan.findMany({ orderBy: { id: "desc" } })
  return (
    <div>
      <ContentHeader title="Inventaris Peralatan" breadcrumb={[{ label: "Inventaris" }, { label: "Peralatan" }]} />
      <Box title={`Daftar Peralatan dan Mesin (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama Barang</Th><Th>Kode</Th><Th>Register</Th><Th>Merk</Th><Th>Tahun</Th><Th>Asal</Th><Th>Harga</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.nama_barang}</Td><Td>{row.kode_barang}</Td><Td>{row.register}</Td><Td>{row.merk ?? "-"}</Td><Td>{row.tahun_pengadaan}</Td><Td>{row.asal}</Td><Td>{row.harga.toLocaleString("id-ID")}</Td><Td><StatusLabel ok={row.visible === 1} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
