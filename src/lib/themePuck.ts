import { z } from "zod"

// ── Route Keys ────────────────────────────────────────────────────────
export const PUCK_ROUTE_KEYS = ["home", "article-detail", "category-list", "layanan-mandiri"] as const
export type PublicRouteKey = (typeof PUCK_ROUTE_KEYS)[number]

// Builtin pages — hanya halaman PUBLIC. Admin tidak pernah masuk daftar ini.
export const BUILTIN_PAGES: { key: string; label: string; path: string }[] = [
  { key: "home", label: "Beranda", path: "/" },
  { key: "article-detail", label: "Artikel", path: "/artikel/..." },
  { key: "category-list", label: "Kategori", path: "/kategori/..." },
  { key: "layanan-mandiri", label: "Layanan Mandiri", path: "/layanan-mandiri" },
]

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isPublicRouteKey(v: string): v is PublicRouteKey {
  return (PUCK_ROUTE_KEYS as readonly string[]).includes(v)
}

export function isValidRouteKey(v: string): boolean {
  return isPublicRouteKey(v) || (SLUG_RE.test(v) && v !== "admin" && !v.startsWith("admin-"))
}

export function pagePathFor(routeKey: string): string {
  return BUILTIN_PAGES.find((p) => p.key === routeKey)?.path ?? `/p/${routeKey}`
}

// ── Allowed block types for OpenSID Puck themes ──────────────────────
export const PUCK_BLOCK_TYPES = [
  "SiteHeader", "SiteFooter", "Navigation", "RunningText",
  "HeroCard", "SectionHeader", "FeaturedArticle",
  "Heading", "RichText", "Image", "Button", "Section", "Columns", "Spacer", "Divider",
  "ArticleList", "ArticleDetail", "CategoryList", "CategoryWidget",
  "Statistics", "VillageApparatus",
  "DateCard", "LoginWidget", "SidebarWidget", "SearchBar", "SocialLinks", "WidgetArea",
  "Text", "Icon", "Logo", "LoginButton", "StatBar", "PersonCard", "CategoryItem", "ArticleCard", "Div",
] as const
export type PuckBlockType = (typeof PUCK_BLOCK_TYPES)[number]

// ── Zod schema for validated Puck data ────────────────────────────────
const MAX_PUCK_JSON_BYTES = 256_000

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

// ── Starter layouts (matching current homepage) ──────────────────────

export function starterPuckData(routeKey: string): PuckLayout {
  switch (routeKey) {
    case "home":
      return {
        content: [
          { type: "SiteHeader", props: {} },
          { type: "Navigation", props: { style: "green" } },
          { type: "RunningText", props: {} },
          {
            type: "Columns", props: {
              columnCount: 2, gap: 28, template: "minmax(0,1fr) 445px",
              col1: [
                { type: "HeroCard", props: {
                  title: "Selamat Datang",
                  subtitle: "Website Resmi Desa",
                  description: "Portal informasi resmi desa. Temukan berita, layanan, dan profil desa di sini.",
                  ctaText: "Selengkapnya",
                  ctaLink: "#",
                }},
                { type: "SectionHeader", props: { title: "Berita Utama", icon: "fa-newspaper-o", showAction: "true", actionText: "Lihat Semua", actionLink: "/artikel" } },
                { type: "FeaturedArticle", props: {} },
                { type: "SectionHeader", props: { title: "Artikel Terkini", icon: "fa-clock-o" } },
                { type: "ArticleList", props: { limit: 6, columns: 2, showImage: true } },
              ],
              col2: [
                { type: "DateCard", props: {} },
                {
                  type: "Div", props: {
                    display: "block", padding: 26, background: "rgba(255,255,255,.94)",
                    border: "1px solid #dde4ea", borderRadius: 14,
                    boxShadow: "0 12px 30px rgba(30,50,80,.06)", _marginTop: 12,
                    content: [
                      { type: "Heading", props: { text: "Masuk", level: 2, fontSize: 20, fontWeight: 900 } },
                      { type: "LoginButton", props: { text: "Layanan Mandiri", href: "/layanan-mandiri", icon: "fa-user", bgColor: "linear-gradient(135deg,#3daa46,#2b923e)" } },
                      { type: "LoginButton", props: { text: "Admin", href: "/siteman", icon: "fa-shield", bgColor: "linear-gradient(135deg,#006c50,#00513d)", _marginTop: 12 } },
                    ],
                  },
                },
                {
                  type: "Div", props: {
                    display: "block", padding: 26, background: "rgba(255,255,255,.94)",
                    border: "1px solid #dde4ea", borderRadius: 14,
                    boxShadow: "0 12px 30px rgba(30,50,80,.06)", _marginTop: 12,
                    content: [
                      { type: "Heading", props: { text: "Menu Kategori", level: 2, fontSize: 20, fontWeight: 900 } },
                      { type: "CategoryWidget", props: { limit: 6 } },
                    ],
                  },
                },
                {
                  type: "Div", props: {
                    display: "block", padding: 26, background: "rgba(255,255,255,.94)",
                    border: "1px solid #dde4ea", borderRadius: 14,
                    boxShadow: "0 12px 30px rgba(30,50,80,.06)", _marginTop: 12,
                    content: [
                      { type: "Heading", props: { text: "Statistik Penduduk", level: 2, fontSize: 20, fontWeight: 900 } },
                      { type: "Statistics", props: {} },
                    ],
                  },
                },
                {
                  type: "Div", props: {
                    display: "block", padding: 26, background: "rgba(255,255,255,.94)",
                    border: "1px solid #dde4ea", borderRadius: 14,
                    boxShadow: "0 12px 30px rgba(30,50,80,.06)", _marginTop: 12,
                    content: [
                      { type: "Heading", props: { text: "Aparatur Desa", level: 2, fontSize: 20, fontWeight: 900 } },
                      { type: "VillageApparatus", props: { limit: 4 } },
                    ],
                  },
                },
              ],
            },
          },
          { type: "SiteFooter", props: {} },
        ],
      }
    case "article-detail":
      return {
        content: [
          { type: "SiteHeader", props: {} },
          { type: "Navigation", props: { style: "green" } },
          { type: "ArticleDetail", props: {} },
          { type: "SiteFooter", props: {} },
        ],
      }
    case "category-list":
      return {
        content: [
          { type: "SiteHeader", props: {} },
          { type: "Navigation", props: { style: "green" } },
          { type: "SectionHeader", props: { title: "Kategori", icon: "fa-bookmark" } },
          { type: "CategoryList", props: {} },
          { type: "SiteFooter", props: {} },
        ],
      }
    case "layanan-mandiri":
      return {
        content: [
          { type: "SiteHeader", props: {} },
          { type: "Navigation", props: { style: "green" } },
          { type: "SectionHeader", props: { title: "Layanan Mandiri", icon: "fa-users" } },
          { type: "RichText", props: { html: "<p>Layanan mandiri desa.</p>" } },
          { type: "SiteFooter", props: {} },
        ],
      }
    default:
      return {
        content: [
          { type: "SiteHeader", props: {} },
          { type: "Navigation", props: { style: "green" } },
          { type: "SectionHeader", props: { title: routeKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), icon: "fa-file-text" } },
          { type: "RichText", props: { html: "<p>Konten halaman.</p>" } },
          { type: "SiteFooter", props: {} },
        ],
      }
  }
}
