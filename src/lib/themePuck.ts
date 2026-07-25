import { z } from "zod"

// ── Route Keys ────────────────────────────────────────────────────────
export const PUCK_ROUTE_KEYS = ["home", "article-detail", "category-list", "layanan-mandiri"] as const
export type PublicRouteKey = (typeof PUCK_ROUTE_KEYS)[number]

export function isPublicRouteKey(v: string): v is PublicRouteKey {
  return (PUCK_ROUTE_KEYS as readonly string[]).includes(v)
}

// ── Allowed block types for OpenSID Puck themes ──────────────────────
export const PUCK_BLOCK_TYPES = [
  "SiteHeader", "SiteFooter", "ArticleDetail", "ArticleList", "CategoryList",
  "Statistics", "VillageApparatus", "WidgetArea", "RunningText",
  "Heading", "RichText", "Image", "Button", "Section", "Columns",
  "Spacer", "Divider", "Navigation",
] as const
export type PuckBlockType = (typeof PUCK_BLOCK_TYPES)[number]

// ── Zod schema for validated Puck data ────────────────────────────────
const MAX_PUCK_JSON_BYTES = 256_000 // 256 KB database-safe limit

const puckBlockSchema = z.object({
  type: z.string().refine((v) => (PUCK_BLOCK_TYPES as readonly string[]).includes(v), { message: "Unknown block type" }),
  props: z.record(z.string(), z.unknown()).optional().default({}),
})

const puckContentSchema = z.object({
  content: z.array(puckBlockSchema).max(200),
  root: z.record(z.string(), z.unknown()).optional(),
  zones: z.record(z.string(), z.array(puckBlockSchema)).optional(),
})

export type PuckLayout = z.infer<typeof puckContentSchema>

export function parsePuckLayout(value: unknown): PuckLayout {
  if (!value || typeof value !== "object") {
    throw new Error("Puck layout must be a non-null object")
  }
  const raw = JSON.stringify(value)
  if (raw.length > MAX_PUCK_JSON_BYTES) {
    throw new Error(`Puck data exceeds size limit of ${MAX_PUCK_JSON_BYTES} bytes`)
  }
  return puckContentSchema.parse(value)
}

// ── Starter layouts ───────────────────────────────────────────────────
function starterBlocks(extra: Record<string, any>[] = []): { content: any[] } {
  return {
    content: [
      { type: "SiteHeader", props: {} },
      ...extra,
      { type: "SiteFooter", props: {} },
    ],
  }
}

export function starterPuckData(routeKey: PublicRouteKey): PuckLayout {
  const body: Record<string, any> = { content: [] }

  switch (routeKey) {
    case "home":
      return starterBlocks([
        { type: "Heading", props: { text: "Selamat Datang" } },
        { type: "Statistics", props: {} },
        { type: "ArticleList", props: { limit: 5 } },
        { type: "VillageApparatus", props: { limit: 4 } },
      ]) as PuckLayout
    case "article-detail":
      return starterBlocks([
        { type: "ArticleDetail", props: {} },
      ]) as PuckLayout
    case "category-list":
      return starterBlocks([
        { type: "Heading", props: { text: "Kategori" } },
        { type: "CategoryList", props: {} },
      ]) as PuckLayout
    case "layanan-mandiri":
      return starterBlocks([
        { type: "Heading", props: { text: "Layanan Mandiri" } },
        { type: "RichText", props: { html: "<p>Layanan mandiri desa.</p>" } },
      ]) as PuckLayout
  }
}
