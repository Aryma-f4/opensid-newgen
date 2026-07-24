import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function Page() {
  const rows = await prisma.covid19_vaksin.findMany({ orderBy: { id_penduduk: "desc" }, take: 100 })
  return (<div>
    <ContentHeader title="Vaksin Covid" breadcrumb={[{ label: "Kependudukan" }, { label: "Vaksin Covid" }]} />
    <Box title={`Vaksin Covid (${rows.length})`} noPadding>
      <LteTable head={<><Th>Nama</Th><Th>NIK</Th><Th>Tahap</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={99} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.nama ?? "-"}</Td><Td>{r.nik ?? "-"}</Td><Td>{r.tahap ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
