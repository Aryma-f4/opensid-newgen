import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function Page() {
  const rows = await prisma.kehadiran_pengajuan_izin.findMany({
    orderBy: { id: "desc" },
    take: 100,
  })
  return (<div>
    <ContentHeader title="Persetujuan Izin" breadcrumb={[{ label: "Kehadiran" }, { label: "Persetujuan Izin" }]} />
    <Box title={`Persetujuan Izin (${rows.length})`} noPadding>
      <LteTable head={<><Th>Alasan</Th><Th>Mulai</Th><Th>Selesai</Th><Th>Status</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((row) => (<tr key={row.id}><Td>{row.keterangan}</Td><Td>{row.tanggal_mulai.toLocaleDateString("id-ID")}</Td><Td>{row.tanggal_selesai.toLocaleDateString("id-ID")}</Td><Td>{row.status_approval}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
