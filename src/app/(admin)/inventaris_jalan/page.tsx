import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function InventarisJalanPage() {
  const rows = await prisma.inventaris_jalan.findMany({ orderBy: { id: "desc" } })
  return (
    <div>
      <ContentHeader title="Inventaris Jalan" breadcrumb={[{ label: "Inventaris" }, { label: "Jalan" }]} />
      <Box title={`Daftar Jalan, Irigasi, Jaringan (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama Barang</Th><Th>Kode</Th><Th>Register</Th><Th>Konstruksi</Th><Th>Panjang</Th><Th>Lebar</Th><Th>Kondisi</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.nama_barang}</Td><Td>{row.kode_barang}</Td><Td>{row.register}</Td><Td>{row.kontruksi}</Td><Td>{row.panjang}</Td><Td>{row.lebar}</Td><Td>{row.kondisi}</Td><Td><StatusLabel ok={row.visible === 1} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
