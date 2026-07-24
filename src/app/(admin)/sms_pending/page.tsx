import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function Page() {
  const rows = await prisma.outbox.findMany({ take: 100 })
  return (<div>
    <ContentHeader title="SMS Pending" breadcrumb={[{ label: "SMS" }, { label: "SMS Pending" }]} />
    <Box title={`SMS Pending (${rows.length})`} noPadding>
      <LteTable head={<><Th>DestinationNumber</Th><Th>TextDecoded</Th><Th>SendingDateTime</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={99} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.DestinationNumber ?? "-"}</Td><Td>{r.TextDecoded ?? "-"}</Td><Td>{r.SendingDateTime ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
