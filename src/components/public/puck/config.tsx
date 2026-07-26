"use client"

import { BLOCK_RENDERERS, BLOCK_FIELDS, buildWrapperStyle } from "./blocks"

// ── Universal style fields (Elementor-style, on EVERY block) ────────
// Prefixed with _ so they never clash with block-specific props

export const STYLE_FIELDS = [
  { name: "_padding", label: "Padding (px)", type: "number" as const },
  { name: "_paddingTop", label: "Padding Atas (px)", type: "number" as const },
  { name: "_paddingBottom", label: "Padding Bawah (px)", type: "number" as const },
  { name: "_margin", label: "Margin (px)", type: "number" as const },
  { name: "_marginTop", label: "Margin Atas (px)", type: "number" as const },
  { name: "_marginBottom", label: "Margin Bawah (px)", type: "number" as const },
  { name: "_background", label: "Background", type: "text" as const },
  { name: "_color", label: "Warna Teks", type: "text" as const },
  { name: "_fontSize", label: "Ukuran Font (px)", type: "number" as const },
  { name: "_fontWeight", label: "Ketebalan Font", type: "number" as const },
  { name: "_textAlign", label: "Rata Teks", type: "select" as const, options: [{ value: "", label: "Default" }, { value: "left", label: "Kiri" }, { value: "center", label: "Tengah" }, { value: "right", label: "Kanan" }] },
  { name: "_border", label: "Border", type: "text" as const },
  { name: "_borderRadius", label: "Border Radius (px)", type: "number" as const },
  { name: "_boxShadow", label: "Box Shadow", type: "text" as const },
  { name: "_width", label: "Lebar", type: "text" as const },
  { name: "_maxWidth", label: "Lebar Maks", type: "text" as const },
  { name: "_height", label: "Tinggi", type: "text" as const },
  { name: "_minHeight", label: "Tinggi Min", type: "text" as const },
  { name: "_opacity", label: "Opasitas (0-1)", type: "number" as const },
  { name: "_customCss", label: "Custom CSS (properti: nilai; ...)", type: "textarea" as const },
]

// ── Component registry ───────────────────────────────────────────────

export const publicPuckComponents: Record<string, any> = {}

for (const [name, render] of Object.entries(BLOCK_RENDERERS)) {
  const def = (BLOCK_FIELDS as any)[name] || { fields: [] }
  publicPuckComponents[name] = {
    render: (props: any) => {
      const Comp = render
      return <div style={buildWrapperStyle(props)}>{Comp(props)}</div>
    },
    fields: [
      ...def.fields.map((f: any) => ({
        type: f.type, // pass through: text, textarea, number, select, checkbox, slot
        name: f.name,
        label: f.label,
        ...(f.options ? { options: f.options } : {}),
      })),
      ...STYLE_FIELDS.map((f: any) => ({
        type: f.type,
        name: f.name,
        label: `⚙ ${f.label}`,
        ...(f.options ? { options: f.options } : {}),
      })),
    ],
    defaultProps: def.fields.reduce((d: any, f: any) => {
      if (f.defaultValue !== undefined && f.type !== "slot") d[f.name] = f.defaultValue
      return d
    }, {}),
  }
}

export const PUCK_CATEGORIES: Record<string, string[]> = {
  "Layout": ["Div", "Section", "Columns", "Spacer", "Divider"],
  "Dasar": ["Text", "Heading", "RichText", "Image", "Button", "Icon", "Logo"],
  "Header": ["SiteHeader", "SearchBar", "Navigation"],
  "Hero": ["HeroCard", "SectionHeader"],
  "Konten": ["FeaturedArticle", "ArticleCard"],
  "Data Desa": ["ArticleList", "ArticleDetail", "CategoryList", "CategoryWidget", "Statistics", "StatBar", "VillageApparatus", "PersonCard", "RunningText"],
  "Sidebar": ["DateCard", "LoginWidget", "LoginButton", "SidebarWidget", "CategoryItem", "WidgetArea"],
  "Footer": ["SiteFooter", "SocialLinks"],
}

export function renderPuckLayout(data: any, context?: any): React.ReactNode {
  if (!data?.content) return null
  return (
    <>
      {data.content.map((block: any, i: number) => {
        const Comp = BLOCK_RENDERERS[block.type]
        if (!Comp) return null
        const props = block.props || {}
        return <div key={`block-${i}`} style={buildWrapperStyle(props)}>{Comp({ ...props, __ctx: context })}</div>
      })}
    </>
  )
}
