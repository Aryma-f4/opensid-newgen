import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import PuckThemeEditor from "./PuckThemeEditor"

export const dynamic = "force-dynamic"

export default async function CustomizePage() {
  const [themes] = await Promise.all([
    prisma.theme.findMany({ orderBy: { id: "desc" } as any }),
  ])

  // Load Puck layouts for all Puck themes
  const puckThemes = themes.filter((t: any) => t.renderer === "puck")
  const layouts: Record<string, any> = {}

  if (puckThemes.length > 0) {
    const allLayouts = await prisma.theme_page_layouts.findMany({
      where: { theme_id: { in: puckThemes.map((t: any) => t.id) } },
    })

    for (const layout of allLayouts) {
      const key = `${layout.theme_id}-${layout.route_key}`
      layouts[key] = layout.puck_data
    }
  }

  return (
    <div className="h-full" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div style={{ padding: "8px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <ContentHeader
          title="Editor Visual (Puck)"
          subtitle="Edit tampilan website secara real-time"
          breadcrumb={[{ label: "Website" }, { label: "Theme", href: "/theme" }, { label: "Kustomisasi" }]}
        />
      </div>

      <PuckThemeEditor
        themes={themes.map((t: any) => ({ id: String(t.id), nama: t.nama, status: t.status, renderer: t.renderer }))}
        initialLayouts={layouts}
      />
    </div>
  )
}
