"use client"

import { useState, useEffect } from "react"
import { BLOCK_RENDERERS, BLOCK_FIELDS, buildWrapperStyle } from "./blocks"

// ── Color field renderer (uses HTML5 input type=color) ───────────────
function ColorFieldRender({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  const [val, setVal] = useState("")
  useEffect(() => { setVal(value || "#000000") }, [value])
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input type="color" value={val} onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value) }} style={{ width: 40, height: 36, border: 0, cursor: "pointer", padding: 0, borderRadius: 4 }} />
      <input type="text" value={val} onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value) }} style={{ flex: 1, padding: "4px 8px", borderRadius: 4, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 12 }} />
    </div>
  )
}

// ── Universal style fields (Elementor-style, on EVERY block) ────────
// Prefixed with _ so they never clash with block-specific props

export const STYLE_FIELDS = [
  { name: "_padding", label: "Padding (px)", type: "number" as const },
  { name: "_paddingTop", label: "Padding Atas (px)", type: "number" as const },
  { name: "_paddingBottom", label: "Padding Bawah (px)", type: "number" as const },
  { name: "_margin", label: "Margin (px)", type: "number" as const },
  { name: "_marginTop", label: "Margin Atas (px)", type: "number" as const },
  { name: "_marginBottom", label: "Margin Bawah (px)", type: "number" as const },
  { name: "_background", label: "Background", type: "custom" as const, render: ColorFieldRender },
  { name: "_color", label: "Warna Teks", type: "custom" as const, render: ColorFieldRender },
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

// ── Category mapping: component → category label ────────────────────
const COMPONENT_CATEGORY: Record<string, string> = {
  "Div": "Layout", "Section": "Layout", "Columns": "Layout", "Spacer": "Layout", "Divider": "Layout",
  "Text": "Dasar", "Heading": "Dasar", "RichText": "Dasar", "Image": "Dasar", "Button": "Dasar", "Icon": "Dasar", "Logo": "Dasar",
  "SiteHeader": "Header", "SearchBar": "Header", "Navigation": "Header",
  "HeroCard": "Hero", "SectionHeader": "Hero",
  "FeaturedArticle": "Konten", "ArticleCard": "Konten",
  "ArticleList": "Data Desa", "ArticleDetail": "Data Desa", "CategoryList": "Data Desa", "CategoryWidget": "Data Desa",
  "Statistics": "Data Desa", "StatBar": "Data Desa", "VillageApparatus": "Data Desa", "PersonCard": "Data Desa", "RunningText": "Data Desa",
  "DateCard": "Sidebar", "LoginWidget": "Sidebar", "LoginButton": "Sidebar", "SidebarWidget": "Sidebar", "CategoryItem": "Sidebar", "WidgetArea": "Sidebar",
  "SiteFooter": "Footer", "SocialLinks": "Footer",
}

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
        type: f.type === "color" ? "custom" : f.type === "custom" ? "custom" : f.type,
        name: f.name,
        label: f.label,
        ...(f.type === "color" || (f.type === "custom" && f.render) ? { render: f.type === "color" ? ColorFieldRender : f.render } : {}),
        ...(f.options ? { options: f.options } : {}),
      })),
      ...STYLE_FIELDS.map((f: any) => ({
        type: f.type === "color" ? "custom" : f.type === "custom" ? "custom" : f.type,
        name: f.name,
        label: `⚙ ${f.label}`,
        ...(f.type === "color" || (f.type === "custom" && f.render) ? { render: f.type === "color" ? ColorFieldRender : f.render } : {}),
        ...(f.options ? { options: f.options } : {}),
      })),
    ].reduce((acc: any, f: any) => {
      const { name, ...fieldDef } = f
      acc[name] = fieldDef
      return acc
    }, {}),
    defaultProps: def.fields.reduce((d: any, f: any) => {
      if (f.defaultValue !== undefined && f.type !== "slot") d[f.name] = f.defaultValue
      return d
    }, {}),
    category: COMPONENT_CATEGORY[name] || "Lainnya",
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
