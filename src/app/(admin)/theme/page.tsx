import { prisma } from "@/lib/prisma"
import Manager from "./Manager"
import { ContentHeader } from "@/components/admin/Ui"
import Link from "next/link"
export const dynamic = "force-dynamic"

export default async function Page() {
  const data = await prisma.theme.findMany({ orderBy: { id: "desc" as any }, take: 100 })
  const [templates, widgets] = await Promise.all([
    prisma.theme_templates.count(),
    prisma.theme_widgets.count(),
  ])

  return (
    <div>
      <ContentHeader title="Theme" subtitle="Manajemen Tema & Kustomisasi" breadcrumb={[{ label: "Website" }, { label: "Theme" }]} />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="small-box bg-aqua"><div className="inner"><h3>{templates}</h3><p>Template</p></div><div className="icon"><i className="fa fa-file-code-o" /></div><Link href="/theme/templates" className="small-box-footer">Kelola <i className="fa fa-arrow-circle-right" /></Link></div>
        <div className="small-box bg-green"><div className="inner"><h3>{widgets}</h3><p>Widget</p></div><div className="icon"><i className="fa fa-th-large" /></div><Link href="/theme/widgets" className="small-box-footer">Kelola <i className="fa fa-arrow-circle-right" /></Link></div>
        <div className="small-box bg-yellow"><div className="inner"><h3><i className="fa fa-paint-brush" /></h3><p>Kustomisasi</p></div><div className="icon"><i className="fa fa-paint-brush" /></div><Link href="/theme/customize" className="small-box-footer">Buka <i className="fa fa-arrow-circle-right" /></Link></div>
        <div className="small-box bg-purple"><div className="inner"><h3><i className="fa fa-cog" /></h3><p>Pengaturan</p></div><div className="icon"><i className="fa fa-cog" /></div><Link href="/theme/settings" className="small-box-footer">Buka <i className="fa fa-arrow-circle-right" /></Link></div>
      </div>
      <Manager initial={data} />
    </div>
  )
}
