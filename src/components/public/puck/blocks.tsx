import type { ReactNode } from "react"
import type { PublicThemeContext } from "./types"

// ── Block Props Types ────────────────────────────────────────────────

type BaseProps = { className?: string }

type HeadingProps = BaseProps & { text?: string; level?: number; align?: string; color?: string }
type RichTextProps = BaseProps & { html?: string }
type ImageProps = BaseProps & { src?: string; alt?: string; width?: number; height?: number }
type ButtonProps = BaseProps & { text?: string; href?: string; variant?: string }
type SectionProps = BaseProps & { background?: string; padding?: number; children?: ReactNode }
type ColumnsProps = BaseProps & { columns?: number; gap?: number; children?: ReactNode }
type ArticleListProps = BaseProps & { limit?: number; showImage?: boolean }
type StatisticsProps = BaseProps & {}
type ApparatusProps = BaseProps & { limit?: number }
type WidgetAreaProps = BaseProps & {}

// ── Helper to render context data ────────────────────────────────────

function useCtx(props: any): PublicThemeContext {
  return (props as any).__ctx as PublicThemeContext || {
    routeKey: "home" as any,
    config: {}, statistics: { totalPenduduk: 0, totalKeluarga: 0, lakiLaki: 0, perempuan: 0 },
    apparatus: [],
  }
}

// ── Structural Blocks ────────────────────────────────────────────────

function SectionBlock({ background, padding, style, children }: any) {
  return (
    <section style={{ background, padding: padding ?? 24, ...(style || {}) }}>
      {children}
    </section>
  )
}

function ColumnsBlock({ columns = 2, gap = 16, children }: any) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
      {children}
    </div>
  )
}

function SpacerBlock({ height = 24 }: any) {
  return <div style={{ height, width: "100%" }} />
}

function DividerBlock({ style }: any) {
  return <hr style={{ border: "none", borderTop: "1px solid #d0d5dd", margin: "16px 0", ...(style || {}) }} />
}

// ── Content Blocks ───────────────────────────────────────────────────

function HeadingBlock({ text = "", level = 2, align = "left", color }: HeadingProps) {
  const Tag = `h${Math.min(Math.max(level || 2, 1), 6)}` as any
  return <Tag style={{ textAlign: align as any, color, margin: "0 0 8px" } as any}>{text}</Tag>
}

function RichTextBlock({ html = "" }: RichTextProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: 1.7 }} />
}

function ImageBlock({ src, alt = "", width, height }: ImageProps) {
  if (!src) return <div style={{ background: "#f0f0f0", height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No Image</div>
  return <img src={src} alt={alt} width={width} height={height} style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }} />
}

function ButtonBlock({ text = "Tombol", href = "#", variant = "primary" }: ButtonProps) {
  const isPrimary = variant !== "outline"
  return (
    <a href={href} style={{
      display: "inline-block", padding: "10px 24px", borderRadius: 8,
      background: isPrimary ? "#18864d" : "transparent",
      color: isPrimary ? "#fff" : "#18864d",
      border: isPrimary ? "none" : "2px solid #18864d",
      fontWeight: 700, fontSize: 14, textDecoration: "none",
    }}>{text}</a>
  )
}

// ── Site Data Blocks ─────────────────────────────────────────────────

function SiteHeaderBlock(props: any) {
  const ctx = useCtx(props)
  const { logo, namaDesa, sebutanKecamatan, namaKecamatan, namaKabupaten, showNav = true, menuItems: rawMenu = [] } = props
  let items: any[] = []
  try {
    items = typeof rawMenu === "string" ? JSON.parse(rawMenu) : (Array.isArray(rawMenu) ? rawMenu : [])
  } catch { items = (ctx.menu || []).slice(0, 6) }
  if (items.length === 0) items = (ctx.menu || []).slice(0, 6)
  const villageName = namaDesa || ctx.config.nama_desa || "OpenSID"
  const kec = sebutanKecamatan || "Kec."
  const kecName = namaKecamatan || ctx.config.nama_kecamatan
  const kabName = namaKabupaten || ctx.config.nama_kabupaten

  return (
    <header style={{
      background: "linear-gradient(135deg, #18864d, #005a42)", color: "#fff",
      borderRadius: "0 0 12px 12px", marginBottom: 16,
    }}>
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logo && <img src={logo} alt="" style={{ height: 48, width: 48, objectFit: "contain", borderRadius: 8, background: "#fff" }} />}
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-.02em" }}>{villageName}</h1>
            {(kecName || kabName) && (
              <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 13, fontWeight: 600 }}>
                {kecName ? `${kec} ${kecName}` : ""}{kecName && kabName ? " · " : ""}{kabName || ""}
              </p>
            )}
          </div>
        </div>
      </div>
      {showNav && (
        <nav style={{ display: "flex", gap: 4, padding: "4px 16px 12px", flexWrap: "wrap" }}>
          {(items as any[]).map((item: any, i: number) => {
            const hasSub = item.children && item.children.length > 0
            return (
              <div key={i} style={{ position: "relative", display: "inline-block" }}>
                <a href={item.link || "#"} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  color: "#fff", textDecoration: "none",
                  background: "rgba(255,255,255,.1)",
                  transition: "background .18s, transform .18s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; e.currentTarget.style.transform = "translateY(-1px)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "translateY(0)" }}
                >
                  {item.icon && <i className={`fa ${item.icon}`} style={{ fontSize: 14 }} />}
                  <span>{item.text || item.nama}</span>
                  {hasSub && <i className="fa fa-angle-down" style={{ fontSize: 12, opacity: 0.7 }} />}
                </a>
                {hasSub && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, minWidth: 200, paddingTop: 8,
                    opacity: 0, visibility: "hidden", transition: "opacity .18s, visibility .18s",
                  }}
                    className="nav-submenu"
                  >
                    <div style={{
                      padding: 8, borderRadius: 10, background: "#fff",
                      boxShadow: "0 12px 28px rgba(0,0,0,.15)",
                    }}>
                      {item.children.map((child: any, ci: number) => (
                        <a key={ci} href={child.link || "#"} style={{
                          display: "block", padding: "8px 12px", borderRadius: 6,
                          color: "#1e293b", fontSize: 13, fontWeight: 600, textDecoration: "none",
                        }}>{child.text || child.nama}</a>
                      ))}
                    </div>
                    <style>{`.nav-submenu:hover { opacity: 1 !important; visibility: visible !important; } div:hover > .nav-submenu { opacity: 1; visibility: visible; }`}</style>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      )}
    </header>
  )
}

function SiteFooterBlock(props: any) {
  const { teks, backgroundColor } = props
  return (
    <footer style={{
      background: backgroundColor || "#1e293b", color: "#94a3b8", padding: "24px",
      textAlign: "center", fontSize: 13, borderRadius: "12px 12px 0 0", marginTop: 24,
    }}>
      <p style={{ margin: 0 }}>{teks || `© ${new Date().getFullYear()} OpenSID — Sistem Informasi Desa`}</p>
    </footer>
  )
}

function ArticleListBlock(props: ArticleListProps) {
  const ctx = useCtx(props)
  const articles = ctx.articles || []
  const items = articles.slice(0, props.limit || 5)

  if (items.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Belum ada artikel</div>
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {items.map((a: any) => (
        <article key={a.id} style={{ display: "flex", gap: 16, padding: 16, border: "1px solid #e2e8f0", borderRadius: 10 }}>
          {props.showImage && a.gambar && (
            <img src={a.gambar} alt="" style={{ width: 100, height: 80, objectFit: "cover", borderRadius: 8 }} />
          )}
          <div><h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{a.judul}</h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{a.tgl_upload?.toLocaleDateString?.("id-ID")}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function ArticleDetailBlock(props: any) {
  const ctx = useCtx(props)
  const article = ctx.article

  if (!article) {
    return <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Detail artikel tidak tersedia</div>
  }

  return (
    <article>
      {article.gambar && <img src={article.gambar} alt="" style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />}
      <h1 style={{ fontSize: 28 }}>{article.judul}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.isi }} style={{ lineHeight: 1.8 }} />
    </article>
  )
}

function CategoryListBlock(props: any) {
  const ctx = useCtx(props)
  const categories = ctx.categories || []

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {categories.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Belum ada kategori</div>
      ) : categories.map((cat: any) => (
        <a key={cat.id} href={`/kategori/${cat.id}`} style={{
          display: "flex", justifyContent: "space-between", padding: "10px 16px",
          border: "1px solid #e2e8f0", borderRadius: 8, textDecoration: "none",
          color: "#1e293b", fontWeight: 600, fontSize: 14,
        }}>
          <span>{cat.kategori}</span>
          <span style={{ color: "#94a3b8" }}>{cat.count ?? 0}</span>
        </a>
      ))}
    </div>
  )
}

function StatisticsBlock(props: any) {
  const ctx = useCtx(props)
  const stats = ctx.statistics || { totalPenduduk: 0, lakiLaki: 0, perempuan: 0 }
  const max = Math.max(stats.totalPenduduk, 1)

  const items = [
    { label: "Laki-laki", value: stats.lakiLaki, color: "#3b82f6" },
    { label: "Perempuan", value: stats.perempuan, color: "#8b5cf6" },
    { label: "Total", value: stats.totalPenduduk, color: "#22c55e" },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Statistik Penduduk</h3>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "flex-end", height: 120 }}>
        {items.map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{item.value.toLocaleString()}</div>
            <div style={{ width: 40, height: Math.max(20, (item.value / max) * 80), background: item.color, borderRadius: "4px 4px 0 0" }} />
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VillageApparatusBlock(props: ApparatusProps) {
  const ctx = useCtx(props)
  const apparatus = (ctx.apparatus || []).slice(0, props.limit || 10)

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {apparatus.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Belum ada data perangkat</div>
      ) : apparatus.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            <i className="fa fa-user" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.pamong_nama || "-"}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{p.jabatan || "-"}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NavigationBlock(props: any) {
  const ctx = useCtx(props)
  const { items: rawItems, style: navStyle = "green" } = props
  let items: any[] = []
  try {
    const parsed = typeof rawItems === "string" ? JSON.parse(rawItems) : rawItems
    items = Array.isArray(parsed) ? parsed : []
  } catch { items = [] }
  if (items.length === 0) items = (ctx.menu || []).slice(0, 8)

  const styles: Record<string, any> = {
    green: { bg: "linear-gradient(135deg, #18864d, #005a42)", hover: "rgba(255,255,255,.15)", text: "#fff" },
    blue: { bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", hover: "rgba(255,255,255,.15)", text: "#fff" },
    dark: { bg: "#1e293b", hover: "#334155", text: "#fff" },
    light: { bg: "#f8fafc", hover: "#e2e8f0", text: "#1e293b" },
  }
  const s = styles[navStyle] || styles.green

  return (
    <nav style={{
      display: "flex", gap: 4, padding: "14px 20px", flexWrap: "wrap",
      borderRadius: 13, background: s.bg, boxShadow: "0 8px 24px rgba(0,40,22,.14)",
      marginBottom: 16,
    }}>
      {(items as any[]).map((item: any, i: number) => {
        const hasSub = item.children && item.children.length > 0
        return (
          <div key={i} style={{ position: "relative" }}>
            <a href={item.link || "#"} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: s.text, textDecoration: "none", background: "transparent",
              transition: "background .18s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = s.hover }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              {item.icon && <i className={`fa ${item.icon}`} />}
              <span>{item.text || item.nama}</span>
              {hasSub && <i className="fa fa-angle-down" style={{ fontSize: 12 }} />}
            </a>
            {hasSub && (
              <div style={{
                position: "absolute", top: "100%", left: 0, minWidth: 200, paddingTop: 6,
                opacity: 0, visibility: "hidden", transition: "opacity .18s",
              }}
                className="nav-submenu"
              >
                <div style={{ padding: 8, borderRadius: 10, background: "#fff", boxShadow: "0 12px 28px rgba(0,0,0,.12)" }}>
                  {item.children.map((child: any, ci: number) => (
                    <a key={ci} href={child.link || "#"} style={{ display: "block", padding: "8px 12px", borderRadius: 6, color: "#1e293b", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{child.text || child.nama}</a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

function RunningTextBlock(props: any) {
  const ctx = useCtx(props)
  const texts = ctx.runningText || []
  if (texts.length === 0) return null
  return (
    <div style={{ padding: "8px 16px", background: "#fef3c7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 16 }}>
      <i className="fa fa-bullhorn" style={{ marginRight: 8 }} />
      {texts.map((t: any) => t.teks).join(" • ")}
    </div>
  )
}

function WidgetAreaBlock(props: any) {
  return (
    <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", minHeight: 100 }}>
      <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", margin: 0 }}>Widget Area</p>
    </div>
  )
}

// ── Block field definitions ──────────────────────────────────────────

export const BLOCK_FIELDS = {
  SiteHeader: {
    label: "Header Desa",
    fields: [
      { name: "namaDesa", label: "Nama Desa", type: "text" as const },
      { name: "sebutanKecamatan", label: "Sebutan Kecamatan", type: "text" as const },
      { name: "namaKecamatan", label: "Nama Kecamatan", type: "text" as const },
      { name: "namaKabupaten", label: "Nama Kabupaten", type: "text" as const },
      { name: "logo", label: "URL Logo", type: "text" as const },
      { name: "showNav", label: "Tampilkan Menu", type: "select" as const, options: [{ value: "true", label: "Ya" }, { value: "", label: "Tidak" }], defaultValue: "true" },
      { name: "menuItems", label: "Menu Items (JSON)", type: "textarea" as const, defaultValue: JSON.stringify([
        { text: "Beranda", link: "/", icon: "fa-home", children: [] },
        { text: "Profil", link: "#", icon: "fa-user", children: [{ text: "Sejarah", link: "/sejarah" }] },
        { text: "Kontak", link: "/kontak", icon: "fa-envelope" },
      ], null, 2) },
    ],
  },
  SiteFooter: { label: "Footer", fields: [
    { name: "teks", label: "Teks Footer", type: "text" as const, defaultValue: "© 2025 OpenSID — Sistem Informasi Desa" },
    { name: "backgroundColor", label: "Warna Latar", type: "text" as const, defaultValue: "#1e293b" },
  ]},
  Navigation: {
    label: "Menu Navigasi",
    fields: [
      { name: "style", label: "Gaya", type: "select" as const, options: [{ value: "green", label: "Hijau" }, { value: "blue", label: "Biru" }, { value: "dark", label: "Gelap" }, { value: "light", label: "Terang" }], defaultValue: "green" },
      { name: "items", label: "Menu Items (JSON)", type: "textarea" as const, defaultValue: JSON.stringify([
        { text: "Beranda", link: "/", icon: "fa-home" },
        { text: "Profil", link: "#", icon: "fa-user", children: [{ text: "Sejarah", link: "/sejarah", icon: "fa-info" }, { text: "Visi Misi", link: "/visi" }] },
        { text: "Artikel", link: "/artikel", icon: "fa-newspaper-o" },
        { text: "Kontak", link: "/kontak", icon: "fa-envelope" },
      ], null, 2) },
    ],
  },
  RunningText: { label: "Teks Berjalan", fields: [] },
  Heading: {
    label: "Heading",
    fields: [
      { name: "text", label: "Teks", type: "text" as const, defaultValue: "Judul" },
      { name: "level", label: "Level", type: "select" as const, options: [{ value: 1, label: "H1" }, { value: 2, label: "H2" }, { value: 3, label: "H3" }], defaultValue: 2 },
      { name: "align", label: "Rata", type: "select" as const, options: [{ value: "left", label: "Kiri" }, { value: "center", label: "Tengah" }, { value: "right", label: "Kanan" }], defaultValue: "left" },
      { name: "color", label: "Warna", type: "text" as const },
    ],
  },
  RichText: { label: "Rich Text", fields: [{ name: "html", label: "Konten HTML", type: "textarea" as const }] },
  Image: { label: "Gambar", fields: [{ name: "src", label: "URL Gambar", type: "text" as const }, { name: "alt", label: "Alt Text", type: "text" as const }] },
  Button: {
    label: "Tombol",
    fields: [
      { name: "text", label: "Teks", type: "text" as const, defaultValue: "Tombol" },
      { name: "href", label: "Link", type: "text" as const },
      { name: "variant", label: "Varian", type: "select" as const, options: [{ value: "primary", label: "Primer" }, { value: "outline", label: "Outline" }] },
    ],
  },
  Section: { label: "Section", fields: [{ name: "padding", label: "Padding", type: "number" as const }, { name: "background", label: "Background", type: "text" as const }] },
  Columns: { label: "Kolom", fields: [{ name: "columns", label: "Jumlah Kolom", type: "number" as const, defaultValue: 2 }, { name: "gap", label: "Jarak", type: "number" as const, defaultValue: 16 }] },
  Spacer: { label: "Spasi", fields: [{ name: "height", label: "Tinggi (px)", type: "number" as const, defaultValue: 24 }] },
  Divider: { label: "Pemisah", fields: [] },
  ArticleList: { label: "Daftar Artikel", fields: [{ name: "limit", label: "Jumlah", type: "number" as const, defaultValue: 5 }, { name: "showImage", label: "Tampilkan Gambar", type: "checkbox" as const }] },
  ArticleDetail: { label: "Detail Artikel", fields: [] },
  CategoryList: { label: "Daftar Kategori", fields: [] },
  Statistics: { label: "Statistik", fields: [] },
  VillageApparatus: { label: "Aparatur Desa", fields: [{ name: "limit", label: "Jumlah", type: "number" as const, defaultValue: 10 }] },
  WidgetArea: { label: "Area Widget", fields: [] },
}

// ── Block Render Functions ───────────────────────────────────────────

export const BLOCK_RENDERERS: Record<string, (props: any) => ReactNode> = {
  SiteHeader: SiteHeaderBlock,
  SiteFooter: SiteFooterBlock,
  Navigation: NavigationBlock,
  RunningText: RunningTextBlock,
  Heading: HeadingBlock,
  RichText: RichTextBlock,
  Image: ImageBlock,
  Button: ButtonBlock,
  Section: SectionBlock,
  Columns: ColumnsBlock,
  Spacer: SpacerBlock,
  Divider: DividerBlock,
  ArticleList: ArticleListBlock,
  ArticleDetail: ArticleDetailBlock,
  CategoryList: CategoryListBlock,
  Statistics: StatisticsBlock,
  VillageApparatus: VillageApparatusBlock,
  WidgetArea: WidgetAreaBlock,
}
