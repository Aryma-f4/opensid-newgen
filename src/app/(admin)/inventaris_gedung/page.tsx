import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function InventarisGedungPage() {
  const rows = await prisma.inventaris_gedung.findMany({ orderBy: { id: "desc" } })
  return (
    <div>
      <ContentHeader title="Inventaris Gedung" breadcrumb={[{ label: "Inventaris" }, { label: "Gedung" }]} />
      <Box title={`Daftar Gedung (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama Barang</Th><Th>Kode</Th><Th>Register</Th><Th>Kondisi</Th><Th>Luas</Th><Th>Letak</Th><Th>Harga</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.nama_barang}</Td><Td>{row.kode_barang}</Td><Td>{row.register}</Td><Td>{row.kondisi_bangunan}</Td><Td>{row.luas_bangunan}</Td><Td>{row.letak}</Td><Td>{row.harga?.toLocaleString("id-ID") ?? "-"}</Td><Td><StatusLabel ok={row.visible === 1} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
