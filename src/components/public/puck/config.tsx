"use client"

import { BLOCK_RENDERERS, BLOCK_FIELDS } from "./blocks"

// Puck component registry — maps block names to render functions + field definitions
export const publicPuckComponents: Record<string, any> = {}

for (const [name, render] of Object.entries(BLOCK_RENDERERS)) {
  const def = (BLOCK_FIELDS as any)[name] || { fields: [] }
  publicPuckComponents[name] = {
    render: (props: any) => {
      const Comp = render
      return <div style={{ position: "relative" }}>{Comp(props)}</div>
    },
    fields: def.fields.map((f: any) => ({
      type: f.type === "textarea" ? "text" : f.type,
      name: f.name,
      label: f.label + (f.type === "textarea" ? " (JSON)" : ""),
      ...(f.options ? { options: f.options } : {}),
    })),
    defaultProps: def.fields.reduce((d: any, f: any) => {
      if (f.defaultValue !== undefined) d[f.name] = f.defaultValue
      return d
    }, {}),
  }
}

export const PUCK_CATEGORIES = [
  { label: "Site", components: ["SiteHeader", "SiteFooter", "Navigation", "RunningText"] },
  { label: "Content", components: ["Heading", "RichText", "Image", "Button"] },
  { label: "Structure", components: ["Section", "Columns", "Spacer", "Divider"] },
  { label: "OpenSID Data", components: ["ArticleList", "ArticleDetail", "CategoryList", "Statistics", "VillageApparatus", "WidgetArea"] },
]

export function renderPuckLayout(data: any, context?: any): React.ReactNode {
  if (!data?.content) return null
  return (
    <div style={{ fontFamily: "'Source Sans Pro', sans-serif", maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      {data.content.map((block: any, i: number) => {
        const Comp = BLOCK_RENDERERS[block.type]
        if (!Comp) return null
        return <div key={`block-${i}`}>{Comp({ ...(block.props || {}), __ctx: context })}</div>
      })}
    </div>
  )
}
