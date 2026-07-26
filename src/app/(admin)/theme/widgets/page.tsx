import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import WidgetManager from "./WidgetManager"
export const dynamic = "force-dynamic"

export default async function WidgetsPage() {
  const [widgets, regions] = await Promise.all([
    prisma.theme_widgets.findMany({ orderBy: { sort_order: "asc" as any } }),
    prisma.theme_regions.findMany(),
  ])
  return (<div>
    <ContentHeader title="Widget" subtitle="Atur widget dengan drag and drop" breadcrumb={[{ label: "Website" }, { label: "Theme", href: "/theme" }, { label: "Widget" }]} />
    <WidgetManager widgets={widgets as any[]} regions={regions as any[]} />
  </div>)
}
