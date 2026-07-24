import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function LampiranPage() {
  const rows = await prisma.lampiran_surat.findMany({ orderBy: { id: "desc" }, take: 100 })
  return (<div>
    <ContentHeader title="Lampiran Surat" breadcrumb={[{ label: "Sekretariat" }, { label: "Lampiran" }]} />
    <Box title={`Lampiran (${rows.length})`} noPadding>
      <LteTable head={<><Th>Nama</Th><Th>Surat</Th><Th>Tgl Upload</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.nama ?? "-"}</Td><Td>{r.surat_id ?? "-"}</Td><Td>{r.created_at?.toLocaleDateString("id-ID") ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
