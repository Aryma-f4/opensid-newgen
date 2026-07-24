import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function PengunjungPage() {
  const rows = await prisma.sys_traffic.findMany({ orderBy: { id: "desc" } as any, take: 100 })
  return (<div>
    <ContentHeader title="Pengunjung" subtitle="Statistik Pengunjung" breadcrumb={[{ label: "Website" }, { label: "Pengunjung" }]} />
    <Box title="Pengunjung" noPadding>
      <LteTable head={<><Th>Tanggal</Th><Th>IP</Th><Th>Browser</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.Tanggal?.toLocaleDateString("id-ID") ?? "-"}</Td><Td className="font-mono">{r.IP ?? "-"}</Td><Td>{r.Browser ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
