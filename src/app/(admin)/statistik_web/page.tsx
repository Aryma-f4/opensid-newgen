import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function Page() {
  const rows = await prisma.sys_traffic.findMany({ take: 100 })
  return (<div>
    <ContentHeader title="Statistik Web" breadcrumb={[{ label: "Website" }, { label: "Statistik Web" }]} />
    <Box title={`Statistik Web (${rows.length})`} noPadding>
      <LteTable head={<><Th>Tanggal</Th><Th>IP</Th><Th>Browser</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={99} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.Tanggal ?? "-"}</Td><Td>{r.IP ?? "-"}</Td><Td>{r.Browser ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
