import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function Page() {
  const rows = await prisma.fcm_token.findMany({ take: 100 })
  return (<div>
    <ContentHeader title="Gawai Layanan" breadcrumb={[{ label: "Layanan" }, { label: "Gawai Layanan" }]} />
    <Box title={`Gawai Layanan (${rows.length})`} noPadding>
      <LteTable head={<><Th>Token</Th><Th>Perangkat</Th><Th>Status</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={99} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.token ?? "-"}</Td><Td>{r.perangkat ?? "-"}</Td><Td>{r.status ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
