import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import ThemeCustomizer from "./ThemeCustomizer"
import PuckThemeEditor from "./PuckThemeEditor"

export const dynamic = "force-dynamic"

export default async function CustomizePage() {
  const [themes, templates, widgets, regions] = await Promise.all([
    prisma.theme.findMany({ orderBy: { id: "desc" } as any }),
    prisma.theme_templates.findMany({ orderBy: { id: "desc" as any } }),
    prisma.theme_widgets.findMany({ orderBy: { sort_order: "asc" as any } }),
    prisma.theme_regions.findMany(),
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

  const hasPuckTheme = puckThemes.length > 0
  const activeTheme = themes.find((t: any) => t.status === 1)

  return (
    <div className="h-full" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div style={{ padding: "8px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <ContentHeader
          title={activeTheme?.renderer === "puck" ? "Editor Visual (Puck)" : "Kustomisasi Tema"}
          subtitle="Edit tampilan website secara real-time"
          breadcrumb={[{ label: "Website" }, { label: "Theme", href: "/theme" }, { label: "Kustomisasi" }]}
        />
      </div>

      {hasPuckTheme ? (
        <PuckThemeEditor
          themes={themes.map((t: any) => ({ id: String(t.id), nama: t.nama, status: t.status, renderer: t.renderer }))}
          initialLayouts={layouts}
        />
      ) : (
        <div style={{ padding: 20, overflow: "auto", flex: 1 }}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-yellow-800 text-sm">
            Belum ada tema Puck. Buat tema visual melalui menu Template.
          </div>
          <ThemeCustomizer templates={templates as any[]} widgets={widgets as any[]} regions={regions as any[]} />
        </div>
      )}
    </div>
  )
}
