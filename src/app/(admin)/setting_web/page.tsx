import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function SettingWebPage() {
  const rows = await prisma.setting_aplikasi.findMany({ where: { kategori: { contains: "web" } } })
  return (<div>
    <ContentHeader title="Setting Web" breadcrumb={[{ label: "Pengaturan" }, { label: "Web" }]} />
    <Box title="Pengaturan Web" noPadding>
      <LteTable head={<><Th>Judul</Th><Th>Key</Th><Th>Value</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td>{r.judul ?? "-"}</Td><Td className="font-mono">{r.key}</Td><Td>{r.value ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
