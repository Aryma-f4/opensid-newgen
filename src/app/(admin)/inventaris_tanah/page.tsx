import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function InventarisTanahPage() {
  const rows = await prisma.inventaris_tanah.findMany({ orderBy: { id: "desc" } })
  return (
    <div>
      <ContentHeader title="Inventaris Tanah" breadcrumb={[{ label: "Inventaris" }, { label: "Tanah" }]} />
      <Box title={`Daftar Tanah (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama Barang</Th><Th>Kode</Th><Th>Register</Th><Th>Luas</Th><Th>Letak</Th><Th>Hak</Th><Th>Harga</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.nama_barang}</Td><Td>{row.kode_barang}</Td><Td>{row.register}</Td><Td>{row.luas}</Td><Td>{row.letak}</Td><Td>{row.hak}</Td><Td>{row.harga.toLocaleString("id-ID")}</Td><Td><StatusLabel ok={row.visible === 1} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
