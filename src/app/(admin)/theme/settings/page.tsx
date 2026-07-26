import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, BtnLink } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"

export default async function ThemeSettingsPage() {
  const settings = await prisma.theme_settings.findMany({ orderBy: { id: "desc" as any } })
  return (<div>
    <ContentHeader title="Pengaturan Tema" breadcrumb={[{ label: "Website" }, { label: "Theme", href: "/theme" }, { label: "Pengaturan" }]} />
    <div className="flex gap-2 mb-4">
      <BtnLink href="/theme/customize" color="primary"><i className="fa fa-paint-brush" /> Kustomisasi</BtnLink>
      <BtnLink href="/theme/templates" color="info"><i className="fa fa-file-code-o" /> Template</BtnLink>
      <BtnLink href="/theme/widgets" color="default"><i className="fa fa-th-large" /> Widget</BtnLink>
    </div>
    <Box title={`Pengaturan Tema (${settings.length})`} noPadding>
      <LteTable head={<><Th>Key</Th><Th>Value</Th><Th>Tipe</Th><Th>Template</Th></>}>
        {settings.length === 0 ? (<tr><Td colSpan={4} className="text-center py-8 text-gray-400">Belum ada pengaturan</Td></tr>) : settings.map((s: any) => (
          <tr key={s.id}><Td className="font-mono">{s.setting_key}</Td><Td className="max-w-xs truncate">{s.setting_value ?? "-"}</Td><Td>{s.setting_type ?? "text"}</Td><Td>{s.template_id ?? "-"}</Td></tr>
        ))}
      </LteTable>
    </Box>
  </div>)
}