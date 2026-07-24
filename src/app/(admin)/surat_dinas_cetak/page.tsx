import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
const perPage = 50
export default async function SuratDinasCetakPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams; const page = parseInt(params.page ?? "1")
  const [rows, total] = await Promise.all([
    prisma.surat_dinas.findMany({ orderBy: { id: "desc" as any }, skip: (page - 1) * perPage, take: perPage }),
    prisma.surat_dinas.count(),
  ])
  return (<div>
    <ContentHeader title="Cetak Surat Dinas" breadcrumb={[{ label: "Sekretariat" }, { label: "Cetak Surat Dinas" }]} />
    <Box title={`Cetak Surat Dinas (${total})`} noPadding>
      <LteTable head={<><Th>Nomor</Th><Th>Perihal</Th><Th>Tujuan</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td className="font-mono">{r.nomor ?? "-"}</Td><Td>{r.perihal ?? "-"}</Td><Td>{r.tujuan ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
    <Paging base="/surat_dinas_cetak" page={page} pages={Math.ceil(total / perPage)} />
  </div>)
}
