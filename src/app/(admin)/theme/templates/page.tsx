import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Btn, StatusLabel } from "@/components/admin/Ui"
import Link from "next/link"
export const dynamic = "force-dynamic"

export default async function TemplatesPage() {
  const rows = await prisma.theme_templates.findMany({ orderBy: { is_active: "desc" as any } })
  return (<div>
    <ContentHeader title="Template Tema" breadcrumb={[{ label: "Website" }, { label: "Theme", href: "/theme" }, { label: "Template" }]} />
    <div className="flex gap-2 mb-4">
      <Link href="/theme/customize" className="btn btn-primary btn-sm"><i className="fa fa-paint-brush" /> Kustomisasi</Link>
      <Link href="/theme/widgets" className="btn btn-info btn-sm"><i className="fa fa-th-large" /> Widget</Link>
      <Link href="/theme/settings" className="btn btn-default btn-sm"><i className="fa fa-cog" /> Pengaturan</Link>
    </div>
    <Box title={`Template (${rows.length})`} noPadding>
      <LteTable head={<><Th>Nama</Th><Th>Deskripsi</Th><Th>Tipe</Th><Th>Status</Th><Th>Aksi</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={5} className="text-center py-8 text-gray-400">Belum ada template</Td></tr>) : rows.map((r: any) => (
          <tr key={r.id}><Td className="font-medium">{r.name}</Td><Td className="max-w-xs truncate text-gray-500">{r.description ?? "-"}</Td><Td>{r.type ?? "full"}</Td><Td><StatusLabel ok={r.is_active === 1} /></Td><Td><Link href={`/theme/customize`} className="text-lte-primary hover:underline text-sm">Edit</Link></Td></tr>))}
      </LteTable>
    </Box>
  </div>)
}
