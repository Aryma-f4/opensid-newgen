import type { ReactNode } from "react"
import { DropZone } from "@puckeditor/core"
import type { PublicThemeContext } from "./types"

// ── Shared Design Tokens (matching current site) ───────────────────
const T = {
  green: "#08703f",
  greenDark: "#00543c",
  greenSoft: "#e7f5ec",
  text: "#182033",
  muted: "#667085",
  line: "#dde4ea",
  shadow: "0 16px 36px rgba(25,40,70,.10)",
  font: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
} as const

function useCtx(props: any): PublicThemeContext {
  return (props as any).__ctx as PublicThemeContext || {
    routeKey: "home" as any,
    config: {},
    statistics: { totalPenduduk: 0, totalKeluarga: 0, lakiLaki: 0, perempuan: 0 },
    apparatus: [],
  }
}

// ── Universal style wrapper (applied to every block) ────────────────
// ponytail: naive "key: value;" parser, upgrade to css lib if input gets exotic

export function parseCustomCss(css: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const rule of css.split(";")) {
    const idx = rule.indexOf(":")
    if (idx < 0) continue
    const key = rule.slice(0, idx).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const val = rule.slice(idx + 1).trim()
    if (key && val) out[key] = val
  }
  return out
}

export function buildWrapperStyle(props: any): Record<string, any> {
  const s: Record<string, any> = { position: "relative" }
  if (props._padding != null) s.padding = props._padding
  if (props._paddingTop != null) s.paddingTop = props._paddingTop
  if (props._paddingBottom != null) s.paddingBottom = props._paddingBottom
  if (props._margin != null) s.margin = props._margin
  if (props._marginTop != null) s.marginTop = props._marginTop
  if (props._marginBottom != null) s.marginBottom = props._marginBottom
  if (props._background) s.background = props._background
  if (props._color) s.color = props._color
  if (props._fontSize != null) s.fontSize = props._fontSize
  if (props._fontWeight != null) s.fontWeight = props._fontWeight
  if (props._textAlign) s.textAlign = props._textAlign
  if (props._border) s.border = props._border
  if (props._borderRadius != null) s.borderRadius = props._borderRadius
  if (props._boxShadow) s.boxShadow = props._boxShadow
  if (props._width) s.width = props._width
  if (props._maxWidth) s.maxWidth = props._maxWidth
  if (props._height) s.height = props._height
  if (props._minHeight) s.minHeight = props._minHeight
  if (props._opacity != null) s.opacity = props._opacity
  if (props._customCss) Object.assign(s, parseCustomCss(props._customCss))
  return s
}

// ── Slot renderer (handles Puck slot component OR manual block array) ─

export function renderSlotContent(value: any, ctx?: any): ReactNode {
  if (!value) return null
  // Manual mode: array of { type, props } from DB
  if (Array.isArray(value)) {
    return value.map((b: any, i: number) => {
      const C = BLOCK_RENDERERS[b.type]
      if (!C) return null
      const p = b.props || {}
      return <div key={i} style={buildWrapperStyle(p)}>{C({ ...p, __ctx: ctx })}</div>
    })
  }
  // Puck slot mode: value is a React component
  const SlotComp = value
  return <SlotComp />
}

// ── Div / Container (Elementor-style, slot nesting) ─────────────────

function DivBlock(props: any) {
  const { display = "block", direction = "row", gap, alignItems, justifyContent, flexWrap, gridCols, template, background, padding, borderRadius, border, boxShadow, minHeight, width, maxWidth } = props
  const style: Record<string, any> = { display, background, padding, borderRadius, border, boxShadow, minHeight, width, maxWidth }
  if (display === "flex") {
    style.flexDirection = direction
    style.gap = gap
    style.alignItems = alignItems
    style.justifyContent = justifyContent
    style.flexWrap = flexWrap
  }
  if (display === "grid") {
    style.gridTemplateColumns = template || (gridCols ? `repeat(${gridCols}, 1fr)` : "repeat(2, 1fr)")
    style.gap = gap ?? 16
  }
  return (
    <div style={style} className="puck-dropzone">
      <DropZone zone="content" />
    </div>
  )
}

// ── Section (semantic container, slot nesting) ───────────────────────

function SectionBlock(props: any) {
  const { background, padding = 24, borderRadius = 14, border, boxShadow } = props
  return (
    <section style={{ background, padding, borderRadius, border, boxShadow }} className="puck-dropzone">
      <DropZone zone="content" />
    </section>
  )
}

// ── Columns (multi-slot grid) ────────────────────────────────────────

function ColumnsBlock(props: any) {
  const { col1, col2, col3, col4, columnCount = 2, gap = 28, template } = props
  const cols = [col1, col2, col3, col4].slice(0, Math.min(Math.max(columnCount, 1), 4))
  return (
    <div style={{ display: "grid", gridTemplateColumns: template || `repeat(${cols.length}, 1fr)`, gap }}>
      {cols.map((col, i) => <div key={i} style={{ minWidth: 0 }}>{renderSlotContent(col, props.__ctx)}</div>)}
    </div>
  )
}

// ── SiteHeader ──────────────────────────────────────────────────────

function SiteHeaderBlock(props: any) {
  const ctx = useCtx(props)
  const { logo, namaDesa, sebutanKecamatan, namaKecamatan, namaKabupaten, namaPropinsi, showNav = true, menuItems: rawMenu = [] } = props
  let items: any[] = []
  try {
    items = typeof rawMenu === "string" ? JSON.parse(rawMenu) : (Array.isArray(rawMenu) ? rawMenu : [])
  } catch { items = (ctx.menu || []).slice(0, 6) }
  if (items.length === 0) items = (ctx.menu || []).slice(0, 6)

  const villageName = namaDesa || ctx.config.nama_desa || "OpenSID"
  const kecName = namaKecamatan || ctx.config.nama_kecamatan
  const kabName = namaKabupaten || ctx.config.nama_kabupaten
  const provName = namaPropinsi
  const kec = sebutanKecamatan || "Kec."

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, marginBottom: 22, fontFamily: T.font }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 16, textDecoration: "none", color: T.text }}>
        {logo && <span style={{ width: 58, height: 58, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
          <img src={logo} alt={villageName} style={{ maxWidth: 58, maxHeight: 58, objectFit: "contain" }} />
        </span>}
        <span>
          <strong style={{ display: "block", fontSize: 25, lineHeight: "1.05", letterSpacing: 0 }}>
            {`WEBSITE RESMI KELURAHAN ${villageName}`.toUpperCase()}
          </strong>
          <small style={{ display: "block", marginTop: 8, color: "#687083", fontSize: 15, fontWeight: 700, textTransform: "uppercase" }}>
            Kec. {kecName || "-"} Kab. {kabName || "-"}{provName ? ` Prov. ${provName}` : ""}
          </small>
        </span>
      </div>
      <form style={{ width: "min(510px, 42vw)", height: 58, display: "flex", alignItems: "center", gap: 14, paddingLeft: 20, border: "1px solid #d5dce4", borderRadius: 10, background: "#fff", boxShadow: "0 10px 26px rgba(30,50,80,.04)" }} action="/" method="get">
        <i className="fa fa-search" style={{ color: "#697386", fontSize: 20 }} />
        <input name="cari" placeholder="Cari artikel, berita, informasi..." style={{ flex: 1, height: "100%", border: 0, outline: 0, color: T.text, fontSize: 16, background: "transparent" }} />
        <button type="submit" aria-label="Cari" style={{ width: 94, height: 58, border: 0, borderRadius: "0 10px 10px 0", background: "linear-gradient(135deg,#138943,#00633f)", color: "#fff", fontSize: 24 }}><i className="fa fa-search" /></button>
      </form>
    </header>
  )
}

// ── Navigation ──────────────────────────────────────────────────────

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
    green: { bg: "linear-gradient(135deg, #18864d, #005a42)", hover: "rgba(0,66,42,.30)", text: "#fff" },
    blue: { bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", hover: "rgba(255,255,255,.15)", text: "#fff" },
    dark: { bg: "#1e293b", hover: "#334155", text: "#fff" },
    light: { bg: "#f8fafc", hover: "#e2e8f0", text: "#1e293b" },
  }
  const s = styles[navStyle] || styles.green

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, marginBottom: 20, borderRadius: 13, background: s.bg, boxShadow: "0 14px 32px rgba(0,96,62,.22)", fontFamily: T.font }}>
      <ul style={{ display: "flex", gap: 4, padding: "0 8px", margin: 0, listStyle: "none" }}>
        {(items as any[]).map((item: any, i: number) => {
          const hasSub = item.children && item.children.length > 0
          return (
            <li key={i} style={{ position: "relative" }}>
              <a href={item.link || "#"} style={{
                height: 56, display: "inline-flex", alignItems: "center", gap: 8, padding: "0 12px",
                color: s.text, fontSize: 13, fontWeight: 800, textTransform: "uppercase" as const, whiteSpace: "nowrap",
                borderRadius: 9, textDecoration: "none",
              }}>
                {item.icon && <i className={`fa ${item.icon}`} style={{ fontSize: 18 }} />}
                <span>{item.text || item.nama}</span>
                {hasSub && <i className="fa fa-caret-down" style={{ opacity: 0.8, fontSize: 12 }} />}
              </a>
              {hasSub && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", left: 0, minWidth: 260, padding: 8,
                  border: "1px solid rgba(0,101,67,.12)", borderRadius: 12,
                  background: "rgba(255,255,255,.98)", boxShadow: T.shadow,
                }}>
                  {item.children.map((child: any, ci: number) => (
                    <a key={ci} href={child.link || "#"} style={{
                      display: "block", padding: "11px 13px 11px 30px", borderRadius: 8,
                      color: T.text, fontWeight: 750, fontSize: 14, textDecoration: "none",
                    }}>{child.text || child.nama}</a>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ── RunningText ─────────────────────────────────────────────────────

function RunningTextBlock(props: any) {
  const ctx = useCtx(props)
  const texts = ctx.runningText || []
  if (texts.length === 0) return null
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, padding: "10px 14px", border: `1px solid #dfe8e1`, borderRadius: 10, background: "#fff", color: T.greenDark, fontWeight: 700, fontFamily: T.font }}>
      <i className="fa fa-bullhorn" />
      <div style={{ overflow: "hidden", flex: 1 }}><span style={{ display: "inline-block", minWidth: "100%", whiteSpace: "nowrap" }}>
        {texts.map((t: any) => t.teks).join("   •   ")}
      </span></div>
    </div>
  )
}

// ── HeroCard ────────────────────────────────────────────────────────

function HeroCardBlock(props: any) {
  const { image, title, subtitle, description, ctaText = "Selengkapnya", ctaLink = "#", backgroundColor = "#0b3f2a", overlayOpacity = 78, titleSize = 56, subtitleSize = 25, descSize = 18, height = 520, borderRadius = 16 } = props
  return (
    <div style={{ position: "relative", minHeight: height, overflow: "hidden", borderRadius, boxShadow: T.shadow, background: backgroundColor, fontFamily: T.font }}>
      {image && <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg,rgba(0,46,31,${overlayOpacity / 100}) 0%,rgba(0,76,43,.38) 48%,rgba(0,0,0,.10) 100%)` }} />
      <div style={{ position: "absolute", left: 140, top: "50%", width: "min(520px, calc(100% - 260px))", transform: "translateY(-50%)", color: "#fff" }}>
        {title && <h1 style={{ margin: "0 0 8px", color: "#fff", fontSize: titleSize, lineHeight: 1, fontWeight: 900 }}>{title}</h1>}
        {subtitle && <h2 style={{ margin: "0 0 22px", color: "#fff", fontSize: subtitleSize, fontWeight: 800 }}>{subtitle}</h2>}
        {description && <p style={{ maxWidth: 430, margin: "0 0 28px", color: "rgba(255,255,255,.94)", fontSize: descSize, lineHeight: 1.55, fontWeight: 600 }}>{description}</p>}
        {ctaText && <a href={ctaLink} style={{ display: "inline-flex", alignItems: "center", gap: 14, height: 52, padding: "0 26px", borderRadius: 8, color: "#fff", background: "linear-gradient(135deg,#38a846,#1f8a42)", fontSize: 16, fontWeight: 850, textDecoration: "none", boxShadow: "0 12px 28px rgba(0,79,39,.24)" }}>{ctaText}</a>}
      </div>
    </div>
  )
}

// ── SectionHeader ───────────────────────────────────────────────────

function SectionHeaderBlock(props: any) {
  const { title, icon, showAction = false, actionText = "Lihat Semua", actionLink = "#" } = props
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "32px 0 14px", fontFamily: T.font }}>
      {icon && <span style={{ width: 80, height: 50, display: "grid", placeItems: "center", borderRadius: 9, color: T.green, background: T.greenSoft, fontSize: 25 }}><i className={`fa ${icon}`} /></span>}
      <h2 style={{ margin: 0, flex: 1, color: T.text, fontSize: 26, fontWeight: 900, textTransform: "uppercase" }}>{title}</h2>
      {showAction && <a href={actionLink} style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 45, padding: "0 17px", border: "1px solid #91d3a8", borderRadius: 8, color: T.green, background: "#fff", fontWeight: 800, textDecoration: "none", fontSize: 14 }}>{actionText}</a>}
    </div>
  )
}

// ── FeaturedArticle ─────────────────────────────────────────────────

function FeaturedArticleBlock(props: any) {
  const { image, category, title, excerpt, date, author, link = "#" } = props
  return (
    <div style={{ display: "grid", gridTemplateColumns: "445px minmax(0,1fr)", gap: 28, padding: 14, border: `1px solid ${T.line}`, borderRadius: 14, background: "#fff", boxShadow: T.shadow, fontFamily: T.font }}>
      <div style={{ display: "block", height: 232, overflow: "hidden", borderRadius: 10 }}>
        {image && <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div style={{ padding: "12px 8px 8px 0" }}>
        {category && <span style={{ display: "inline-flex", alignItems: "center", minHeight: 28, padding: "4px 14px", borderRadius: 8, color: T.green, background: T.greenSoft, fontSize: 14, fontWeight: 900, textTransform: "uppercase" }}>{category}</span>}
        {title && <h3 style={{ margin: "12px 0", fontSize: 22, fontWeight: 900, lineHeight: 1.25 }}><a href={link} style={{ color: T.text, textDecoration: "none" }}>{title}</a></h3>}
        {excerpt && <p style={{ color: "#4f5b6e", fontSize: 16, lineHeight: 1.72, margin: 0 }}>{excerpt}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginTop: 18, color: "#677386", fontSize: 14 }}>
          {date && <span><i className="fa fa-calendar" style={{ marginRight: 8 }} />{date}</span>}
          {author && <span><i className="fa fa-user" style={{ marginRight: 8 }} />{author}</span>}
        </div>
      </div>
    </div>
  )
}

// ── ArticleList ─────────────────────────────────────────────────────

function ArticleListBlock(props: any) {
  const ctx = useCtx(props)
  const { limit = 6, columns = 2, showImage = true, titleSize = 17, excerptSize = 14 } = props
  const articles = (ctx.articles || []).slice(0, limit)

  const imgSrc = (g?: string | null) =>
    !g ? null : (g.startsWith("http") || g.startsWith("/") ? g : `/desa/upload/artikel/${g}`)

  if (articles.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Belum ada artikel</div>
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 18, fontFamily: T.font }}>
      {articles.map((a: any) => (
        <article key={a.id} style={{ display: "grid", gridTemplateColumns: showImage ? "145px minmax(0,1fr)" : "1fr", gap: 16, padding: 12, border: `1px solid ${T.line}`, borderRadius: 14, background: "#fff" }}>
          {showImage && imgSrc(a.gambar) && <img src={imgSrc(a.gambar)!} alt="" style={{ height: 118, borderRadius: 9, objectFit: "cover" }} />}
          <div>
            <span style={{ color: T.green, fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>{a.kategori?.kategori || (typeof a.kategori === "string" ? a.kategori : "Artikel")}</span>
            <h3 style={{ margin: "7px 0", fontSize: titleSize, fontWeight: 900, lineHeight: 1.25 }}><a href={`/artikel/${a.slug || a.id}`} style={{ color: T.text, textDecoration: "none" }}>{a.judul}</a></h3>
            {a.isi && <p style={{ margin: 0, fontSize: excerptSize, lineHeight: 1.5, color: "#4f5b6e" }}>{a.isi.replace(/<[^>]*>/g, "").slice(0, 120)}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}

// ── ArticleDetail ───────────────────────────────────────────────────

function ArticleDetailBlock(props: any) {
  const ctx = useCtx(props)
  const article = ctx.article
  if (!article) return <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Detail artikel tidak tersedia</div>

  const imgSrc = article.gambar
    ? (article.gambar.startsWith("http") || article.gambar.startsWith("/") ? article.gambar : `/desa/upload/artikel/${article.gambar}`)
    : null
  const dateStr = article.tgl_upload
    ? new Date(article.tgl_upload).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : null

  return (
    <div style={{ padding: 28, border: `1px solid ${T.line}`, borderRadius: 14, background: "#fff", boxShadow: T.shadow, fontFamily: T.font }}>
      <h1 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 900, color: T.text }}>{article.judul}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 22, color: "#677386", fontWeight: 700, fontSize: 14 }}>
        {dateStr && <span><i className="fa fa-calendar" style={{ marginRight: 8 }} />{dateStr}</span>}
      </div>
      {imgSrc && <img src={imgSrc} alt="" style={{ width: "100%", maxHeight: 430, objectFit: "cover", borderRadius: 12, marginBottom: 22 }} />}
      <div dangerouslySetInnerHTML={{ __html: article.isi || "" }} style={{ color: "#334155", fontSize: 16, lineHeight: 1.8 }} />
    </div>
  )
}

// ── CategoryList ────────────────────────────────────────────────────

function CategoryListBlock(props: any) {
  const ctx = useCtx(props)
  const categories = ctx.categories || []
  return (
    <div style={{ display: "grid", gap: 14, fontFamily: T.font }}>
      {categories.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>Belum ada kategori</div>
      ) : categories.map((cat: any) => (
        <a key={cat.id} href={`/kategori/${cat.id}`} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          border: `1px solid ${T.line}`, borderRadius: 12, background: "#fff",
          color: T.text, fontSize: 15, fontWeight: 700, textDecoration: "none",
        }}>
          <i className="fa fa-angle-right" style={{ color: T.green }} />
          <span style={{ flex: 1 }}>{cat.kategori}</span>
          <span style={{ color: "#94a3b8" }}>{cat.count ?? 0}</span>
        </a>
      ))}
    </div>
  )
}

// ── Statistics ──────────────────────────────────────────────────────

function StatisticsBlock(props: any) {
  const ctx = useCtx(props)
  const { title = "Jumlah Penduduk", totalLabel = "Total Penduduk", suffix = "Jiwa" } = props
  const stats = ctx.statistics || { totalPenduduk: 0, lakiLaki: 0, perempuan: 0 }
  const max = Math.max(stats.lakiLaki, stats.perempuan, stats.totalPenduduk, 1)

  const items = [
    { label: "Laki-laki", value: stats.lakiLaki, gradient: "linear-gradient(180deg,#73b9f5,#4497dc)" },
    { label: "Perempuan", value: stats.perempuan, gradient: "linear-gradient(180deg,#4c4d55,#2d2e35)" },
    { label: "Total", value: stats.totalPenduduk, gradient: "linear-gradient(180deg,#94ea7c,#69d85f)" },
  ]

  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 34, marginBottom: 8, color: T.text, fontWeight: 800, fontSize: 14 }}>
        <span>{title}</span>
      </div>
      <div style={{ height: 180, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignItems: "end", gap: 24, padding: "18px 28px 0", borderBottom: "1px solid #cdd8e0", background: "repeating-linear-gradient(to top, transparent 0, transparent 34px, rgba(110,120,135,.13) 35px)" }}>
        {items.map((item) => (
          <div key={item.label} style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", flexDirection: "column", gap: 7, textAlign: "center" }}>
            <span style={{ color: "#697386", fontSize: 12, fontWeight: 800 }}>{item.value.toLocaleString("id-ID")}</span>
            <span style={{ width: 48, minHeight: 10, display: "block", borderRadius: "4px 4px 0 0", background: item.gradient, height: Math.max(10, Math.round((item.value / max) * 130)) }} />
            <small style={{ minHeight: 35, color: "#5e6879", fontWeight: 700, fontSize: 12 }}>{item.label}</small>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, fontWeight: 850, fontSize: 14 }}>
        <span>{totalLabel}</span>
        <strong style={{ padding: "8px 16px", borderRadius: 999, color: T.green, background: T.greenSoft }}>{stats.totalPenduduk.toLocaleString("id-ID")} {suffix}</strong>
      </div>
    </div>
  )
}

// ── VillageApparatus ────────────────────────────────────────────────

function VillageApparatusBlock(props: any) {
  const ctx = useCtx(props)
  const { limit = 4 } = props
  const apparatus = (ctx.apparatus || []).slice(0, limit)
  const defaultAvatar = "/themes/natra/assets/images/noimage.png"

  return (
    <div style={{ display: "grid", gap: 14, fontFamily: T.font }}>
      {apparatus.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>Belum ada data perangkat</div>
      ) : apparatus.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <img src={p.foto ? `/desa/upload/pamong/${p.foto}` : defaultAvatar} alt={p.pamong_nama || ""} style={{ width: 46, height: 46, borderRadius: 999, objectFit: "cover", background: "#e9f2ec" }} />
          <span>
            <strong style={{ display: "block", color: T.text, fontSize: 14 }}>{p.pamong_nama || "-"}</strong>
            <small style={{ display: "block", color: "#687386", fontSize: 12 }}>{p.ref_jabatan?.nama || (typeof p.jabatan === "string" ? p.jabatan : "-")}</small>
          </span>
        </div>
      ))}
    </div>
  )
}

// ── LoginWidget ─────────────────────────────────────────────────────

function LoginWidgetBlock(props: any) {
  const { title = "Masuk", selfServiceText = "Layanan Mandiri", selfServiceLink = "/layanan-mandiri", adminText = "Admin", adminLink = "/siteman", selfColor = "linear-gradient(135deg,#3daa46,#2b923e)", adminColor = "linear-gradient(135deg,#006c50,#00513d)" } = props
  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ display: "grid", gap: 12 }}>
        <a href={selfServiceLink} style={{ height: 53, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, borderRadius: 7, color: "#fff", fontSize: 16, fontWeight: 900, textTransform: "uppercase", textDecoration: "none", background: selfColor }}><i className="fa fa-user" />{selfServiceText}</a>
        <a href={adminLink} style={{ height: 53, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, borderRadius: 7, color: "#fff", fontSize: 16, fontWeight: 900, textTransform: "uppercase", textDecoration: "none", background: adminColor }}><i className="fa fa-shield" />{adminText}</a>
      </div>
    </div>
  )
}

// ── DateCard ────────────────────────────────────────────────────────

function DateCardBlock(props: any) {
  const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date())
  return (
    <div style={{ minHeight: 106, display: "flex", alignItems: "center", gap: 20, padding: "22px 26px", border: `1px solid ${T.line}`, borderRadius: 14, background: "radial-gradient(circle at 90% 20%,rgba(245,180,95,.16),transparent 46px),linear-gradient(135deg,#fff,#f7faf8)", fontFamily: T.font }}>
      <span style={{ width: 80, height: 50, display: "grid", placeItems: "center", borderRadius: 9, color: T.green, background: T.greenSoft, fontSize: 25 }}><i className="fa fa-calendar" /></span>
      <span>
        <strong style={{ display: "block", color: T.green, fontSize: 18, fontWeight: 900 }}>{today}</strong>
        <small style={{ display: "block", marginTop: 8, color: "#6b7384", fontSize: 15, fontWeight: 700 }}><i className="fa fa-clock-o" /> {time}</small>
      </span>
    </div>
  )
}

// ── CategoryWidget ──────────────────────────────────────────────────

function CategoryWidgetBlock(props: any) {
  const ctx = useCtx(props)
  const { limit = 6 } = props
  const categories = (ctx.categories || []).slice(0, limit)
  return (
    <div style={{ fontFamily: T.font }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 13 }}>
        {categories.map((cat: any) => (
          <li key={cat.id}>
            <a href={`/kategori/${cat.id}`} style={{ display: "flex", alignItems: "center", gap: 10, color: "#5f6978", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              <i className="fa fa-angle-right" /><span>{cat.kategori}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── SocialLinks ──────────────────────────────────────────────────────

function SocialLinksBlock(props: any) {
  const { items: rawItems, iconColor = "#08703f", iconSize = 38 } = props
  let items: any[] = []
  try {
    const parsed = typeof rawItems === "string" ? JSON.parse(rawItems) : rawItems
    items = Array.isArray(parsed) ? parsed : []
  } catch { items = [] }

  return (
    <div style={{ display: "flex", gap: 10, fontFamily: T.font }}>
      {items.map((item: any, i: number) => (
        <a key={i} href={item.link || "#"} target="_blank" rel="noreferrer" aria-label={item.name || item.nama} style={{
          width: iconSize, height: iconSize, display: "grid", placeItems: "center",
          borderRadius: 999, color: "#fff", background: item.color || iconColor,
          textDecoration: "none", fontSize: 16,
        }}><i className={`fa ${item.icon || "fa-share-alt"}`} /></a>
      ))}
    </div>
  )
}

// ── SearchBar ────────────────────────────────────────────────────────

function SearchBarBlock(props: any) {
  const { placeholder = "Cari artikel, berita, informasi...", height = 58, buttonWidth = 94, bgColor = "linear-gradient(135deg,#138943,#00633f)", borderRadius = 10 } = props
  return (
    <form style={{ width: "min(510px, 42vw)", height, display: "flex", alignItems: "center", gap: 14, paddingLeft: 20, border: "1px solid #d5dce4", borderRadius, background: "#fff", boxShadow: "0 10px 26px rgba(30,50,80,.04)", fontFamily: T.font }} action="/" method="get">
      <i className="fa fa-search" style={{ color: "#697386", fontSize: 20 }} />
      <input name="cari" placeholder={placeholder} style={{ flex: 1, height: "100%", border: 0, outline: 0, color: T.text, fontSize: 16, background: "transparent" }} />
      <button type="submit" aria-label="Cari" style={{ width: buttonWidth, height, border: 0, borderRadius: `0 ${borderRadius}px ${borderRadius}px 0`, background: bgColor, color: "#fff", fontSize: 24 }}><i className="fa fa-search" /></button>
    </form>
  )
}

// ── SiteFooter ──────────────────────────────────────────────────────

function SiteFooterBlock(props: any) {
  const ctx = useCtx(props)
  const { teks, backgroundColor } = props
  const villageName = ctx.config.nama_desa || "OpenSID"
  const siteTitle = `Website Resmi Kelurahan ${villageName}`.toUpperCase()
  return (
    <footer style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 28, padding: "26px 0 10px", color: "#606a79", borderTop: `1px solid ${T.line}`, fontFamily: T.font }}>
      <div>
        <strong style={{ color: T.text }}>{siteTitle}</strong>
        <p style={{ margin: "8px 0 0" }}>{teks || `${ctx.config.alamat_kantor || "-"} · Kec. ${ctx.config.nama_kecamatan || "-"} · Kab. ${ctx.config.nama_kabupaten || "-"}`}</p>
      </div>
    </footer>
  )
}

// ── Generic Blocks ──────────────────────────────────────────────────

function HeadingBlock(props: any) {
  const { text = "", level = 2, align = "left", color, fontSize, fontWeight } = props
  const Tag = `h${Math.min(Math.max(level || 2, 1), 6)}` as any
  return <Tag style={{ textAlign: align as any, color, fontSize, fontWeight, margin: "0 0 8px", fontFamily: T.font } as any}>{text}</Tag>
}

function RichTextBlock({ html = "" }: { html?: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: 1.7, fontFamily: T.font }} />
}

function ImageBlock(props: any) {
  const { src, alt = "", width, height, borderRadius = 12, objectFit = "cover" } = props
  if (!src) return <div style={{ background: "#f0f0f0", height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No Image</div>
  return <img src={src} alt={alt} width={width} height={height} style={{ maxWidth: "100%", height: "auto", borderRadius, objectFit } as any} />
}

function ButtonBlock(props: any) {
  const { text = "Tombol", href = "#", variant = "primary", borderRadius = 8, fontSize = 16, paddingH = 26, height = 52, bgColor, textColor } = props
  const isPrimary = variant !== "outline"
  const bg = bgColor || (isPrimary ? "linear-gradient(135deg,#38a846,#1f8a42)" : "transparent")
  const color = textColor || (isPrimary ? "#fff" : T.green)
  return (
    <a href={href} style={{ display: "inline-flex", alignItems: "center", height, padding: `0 ${paddingH}px`, borderRadius, background: bg, color, border: isPrimary ? "none" : `2px solid ${T.green}`, fontWeight: 850, fontSize, textDecoration: "none", boxShadow: isPrimary ? "0 12px 28px rgba(0,79,39,.24)" : "none" }}>{text}</a>
  )
}

function SpacerBlock({ height = 24 }: any) {
  return <div style={{ height, width: "100%" }} />
}

function DividerBlock(props: any) {
  return <hr style={{ border: "none", borderTop: `1px solid ${T.line}`, margin: "16px 0", ...(props.style || {}) }} />
}

function WidgetAreaBlock(props: any) {
  const { text = "Widget Area" } = props
  return (
    <div style={{ padding: "22px 26px", border: `1px solid ${T.line}`, borderRadius: 14, background: "rgba(255,255,255,.94)", boxShadow: "0 12px 30px rgba(30,50,80,.06)", minHeight: 100, fontFamily: T.font }}>
      <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", margin: 0 }}>{text}</p>
    </div>
  )
}

function SidebarWidgetBlock(props: any) {
  const { title, icon, content } = props
  return (
    <div style={{ padding: "22px 26px", border: `1px solid ${T.line}`, borderRadius: 14, background: "rgba(255,255,255,.94)", boxShadow: "0 12px 30px rgba(30,50,80,.06)", fontFamily: T.font }}>
      <h2 style={{ margin: "0 0 22px", borderBottom: `1px solid ${T.line}`, color: T.text, fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>
        {icon && <i className={`fa ${icon}`} style={{ color: T.green, marginRight: 10 }} />}{title}
      </h2>
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </div>
  )
}

// ── Atomic Blocks (Elementor-style, slice of homepage elements) ─────

function TextBlock(props: any) {
  const { text, as = "p", align = "left", color = T.text, fontSize = 16, fontWeight = 400, lineHeight = 1.7, fontStyle, textDecoration, letterSpacing, textTransform } = props
  const displayText = text || "Teks paragraf"
  const Tag = ["p", "span", "strong", "em", "small", "mark", "u", "s"].includes(as) ? as : "p"
  const style: Record<string, any> = { margin: 0, color, fontSize, fontWeight, lineHeight, fontStyle, textDecoration, letterSpacing, textTransform, fontFamily: T.font }
  if (Tag === "p") style.textAlign = align
  return <Tag style={style as any}>{displayText}</Tag>
}

function IconBlock(props: any) {
  const { icon = "fa-star", size = 25, color = T.green, bgColor = T.greenSoft, boxSize = 50, borderRadius = 9 } = props
  return (
    <span style={{ width: boxSize, height: boxSize, display: "inline-grid", placeItems: "center", borderRadius, color, background: bgColor, fontSize: size }}>
      <i className={`fa ${icon}`} />
    </span>
  )
}

function LogoBlock(props: any) {
  const { src, size = 58, borderRadius = 0 } = props
  const finalSrc = src || "/themes/natra/assets/images/noimage.png"
  return (
    <span style={{ width: size, height: size, display: "grid", placeItems: "center" }}>
      <img src={finalSrc} alt="Logo" style={{ maxWidth: size, maxHeight: size, objectFit: "contain", borderRadius }} />
    </span>
  )
}

function LoginButtonBlock(props: any) {
  const { text = "Layanan Mandiri", href = "/layanan-mandiri", icon = "fa-user", bgColor = "linear-gradient(135deg,#3daa46,#2b923e)", textColor = "#fff", height = 53, fontSize = 16, borderRadius = 7 } = props
  return (
    <a href={href} style={{ height, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, borderRadius, color: textColor, fontSize, fontWeight: 900, textTransform: "uppercase", textDecoration: "none", background: bgColor, fontFamily: T.font }}>
      <i className={`fa ${icon}`} />{text}
    </a>
  )
}

function StatBarBlock(props: any) {
  const { label = "Laki-laki", value = 600, maxValue = 1200, gradient = "linear-gradient(180deg,#73b9f5,#4497dc)", barWidth = 48, chartHeight = 130 } = props
  const h = Math.max(10, Math.round((Number(value) / Math.max(Number(maxValue), 1)) * chartHeight))
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexDirection: "column", gap: 7, textAlign: "center", fontFamily: T.font }}>
      <span style={{ color: "#697386", fontSize: 12, fontWeight: 800 }}>{Number(value).toLocaleString("id-ID")}</span>
      <span style={{ width: barWidth, minHeight: 10, display: "block", borderRadius: "4px 4px 0 0", background: gradient, height: h }} />
      <small style={{ color: "#5e6879", fontWeight: 700, fontSize: 12 }}>{label}</small>
    </div>
  )
}

function PersonCardBlock(props: any) {
  const { name = "Nama Pamong", jabatan = "Jabatan", foto, avatarSize = 46, nameSize = 14, titleSize = 12 } = props
  const src = foto ? (foto.startsWith("http") || foto.startsWith("/") ? foto : `/desa/upload/pamong/${foto}`) : "/themes/natra/assets/images/noimage.png"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, fontFamily: T.font }}>
      <img src={src} alt={name} style={{ width: avatarSize, height: avatarSize, borderRadius: 999, objectFit: "cover", background: "#e9f2ec" }} />
      <span>
        <strong style={{ display: "block", color: T.text, fontSize: nameSize }}>{name}</strong>
        <small style={{ display: "block", color: "#687386", fontSize: titleSize }}>{jabatan}</small>
      </span>
    </div>
  )
}

function CategoryItemBlock(props: any) {
  const { name = "Kategori", link = "#", count, showCount = false, color = "#5f6978", fontSize = 15 } = props
  return (
    <a href={link} style={{ display: "flex", alignItems: "center", gap: 10, color, fontSize, fontWeight: 700, textDecoration: "none", fontFamily: T.font }}>
      <i className="fa fa-angle-right" /><span style={{ flex: 1 }}>{name}</span>
      {showCount && count != null && <span style={{ color: "#94a3b8" }}>{count}</span>}
    </a>
  )
}

function ArticleCardBlock(props: any) {
  const { image, category = "Artikel", title = "Judul Artikel", excerpt = "", link = "#", imageHeight = 118, imageWidth = 145, titleSize = 17, excerptSize = 14, showImage = true } = props
  return (
    <article style={{ display: "grid", gridTemplateColumns: showImage ? `${imageWidth}px minmax(0,1fr)` : "1fr", gap: 16, padding: 12, border: `1px solid ${T.line}`, borderRadius: 14, background: "#fff", fontFamily: T.font }}>
      {showImage && (
        image
          ? <img src={image} alt="" style={{ height: imageHeight, borderRadius: 9, objectFit: "cover", width: "100%" }} />
          : <div style={{ height: imageHeight, borderRadius: 9, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No Image</div>
      )}
      <div>
        <span style={{ color: T.green, fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>{category}</span>
        <h3 style={{ margin: "7px 0", fontSize: titleSize, fontWeight: 900, lineHeight: 1.25 }}>
          <a href={link} style={{ color: T.text, textDecoration: "none" }}>{title}</a>
        </h3>
        {excerpt && <p style={{ margin: 0, fontSize: excerptSize, lineHeight: 1.5, color: "#4f5b6e" }}>{excerpt}</p>}
      </div>
    </article>
  )
}

// ── Block field definitions (full customization) ────────────────────

export const BLOCK_FIELDS: Record<string, { label: string; fields: any[] }> = {
  SiteHeader: {
    label: "Header Desa",
    fields: [
      { name: "namaDesa", label: "Nama Desa", type: "text" as const },
      { name: "sebutanKecamatan", label: "Sebutan Kecamatan", type: "text" as const, defaultValue: "Kec." },
      { name: "namaKecamatan", label: "Nama Kecamatan", type: "text" as const },
      { name: "namaKabupaten", label: "Nama Kabupaten", type: "text" as const },
      { name: "namaPropinsi", label: "Nama Provinsi", type: "text" as const },
      { name: "logo", label: "URL Logo", type: "text" as const },
      { name: "showNav", label: "Tampilkan Menu", type: "select" as const, options: [{ value: "true", label: "Ya" }, { value: "", label: "Tidak" }], defaultValue: "true" },
      { name: "menuItems", label: "Menu Items (JSON)", type: "textarea" as const, defaultValue: JSON.stringify([
        { text: "Beranda", link: "/", icon: "fa-home", children: [] },
        { text: "Profil", link: "#", icon: "fa-user", children: [{ text: "Sejarah", link: "/sejarah" }, { text: "Visi Misi", link: "/visi" }] },
        { text: "Artikel", link: "/artikel", icon: "fa-newspaper-o", children: [] },
        { text: "Kontak", link: "/kontak", icon: "fa-envelope", children: [] },
      ], null, 2) },
    ],
  },
  Navigation: {
    label: "Menu Navigasi",
    fields: [
      { name: "style", label: "Gaya", type: "select" as const, options: [{ value: "green", label: "Hijau" }, { value: "blue", label: "Biru" }, { value: "dark", label: "Gelap" }, { value: "light", label: "Terang" }], defaultValue: "green" },
      { name: "items", label: "Menu Items (JSON)", type: "textarea" as const, defaultValue: JSON.stringify([
        { text: "Beranda", link: "/", icon: "fa-home" },
        { text: "Profil", link: "#", icon: "fa-user", children: [{ text: "Sejarah", link: "/sejarah" }, { text: "Visi Misi", link: "/visi" }] },
        { text: "Artikel", link: "/artikel", icon: "fa-newspaper-o" },
        { text: "Kontak", link: "/kontak", icon: "fa-envelope" },
      ], null, 2) },
    ],
  },
  SiteFooter: { label: "Footer", fields: [
    { name: "teks", label: "Teks Footer", type: "text" as const, defaultValue: "© 2025 OpenSID — Sistem Informasi Desa" },
    { name: "backgroundColor", label: "Warna Latar", type: "color" as const, defaultValue: "#1e293b" },
  ]},
  RunningText: { label: "Teks Berjalan", fields: [] },
  HeroCard: {
    label: "Hero Banner",
    fields: [
      { name: "image", label: "URL Gambar", type: "text" as const },
      { name: "title", label: "Judul", type: "text" as const, defaultValue: "Selamat Datang" },
      { name: "subtitle", label: "Sub Judul", type: "text" as const },
      { name: "description", label: "Deskripsi", type: "text" as const },
      { name: "ctaText", label: "Teks Tombol", type: "text" as const, defaultValue: "Selengkapnya" },
      { name: "ctaLink", label: "Link Tombol", type: "text" as const, defaultValue: "#" },
      { name: "backgroundColor", label: "Warna Latar", type: "color" as const, defaultValue: "#0b3f2a" },
      { name: "overlayOpacity", label: "Opasitas Overlay (%)", type: "number" as const, defaultValue: 78 },
      { name: "titleSize", label: "Ukuran Judul (px)", type: "number" as const, defaultValue: 56 },
      { name: "subtitleSize", label: "Ukuran Sub Judul (px)", type: "number" as const, defaultValue: 25 },
      { name: "descSize", label: "Ukuran Deskripsi (px)", type: "number" as const, defaultValue: 18 },
      { name: "height", label: "Tinggi (px)", type: "number" as const, defaultValue: 520 },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 16 },
    ],
  },
  SectionHeader: {
    label: "Judul Section",
    fields: [
      { name: "title", label: "Judul", type: "text" as const, defaultValue: "Berita Utama" },
      { name: "icon", label: "Icon FA", type: "text" as const },
      { name: "showAction", label: "Tampilkan Tombol Aksi", type: "select" as const, options: [{ value: "true", label: "Ya" }, { value: "", label: "Tidak" }], defaultValue: "" },
      { name: "actionText", label: "Teks Aksi", type: "text" as const, defaultValue: "Lihat Semua" },
      { name: "actionLink", label: "Link Aksi", type: "text" as const, defaultValue: "#" },
    ],
  },
  FeaturedArticle: {
    label: "Artikel Unggulan",
    fields: [
      { name: "image", label: "URL Gambar", type: "text" as const },
      { name: "category", label: "Kategori", type: "text" as const },
      { name: "title", label: "Judul", type: "text" as const },
      { name: "excerpt", label: "Ringkasan", type: "text" as const },
      { name: "date", label: "Tanggal", type: "text" as const },
      { name: "author", label: "Penulis", type: "text" as const },
      { name: "link", label: "Link", type: "text" as const, defaultValue: "#" },
    ],
  },
  Heading: {
    label: "Heading",
    fields: [
      { name: "text", label: "Teks", type: "text" as const, defaultValue: "Judul" },
      { name: "level", label: "Level", type: "select" as const, options: [{ value: 1, label: "H1" }, { value: 2, label: "H2" }, { value: 3, label: "H3" }, { value: 4, label: "H4" }], defaultValue: 2 },
      { name: "align", label: "Rata", type: "select" as const, options: [{ value: "left", label: "Kiri" }, { value: "center", label: "Tengah" }, { value: "right", label: "Kanan" }], defaultValue: "left" },
      { name: "color", label: "Warna Teks", type: "color" as const },
      { name: "fontSize", label: "Ukuran Font (px)", type: "number" as const },
      { name: "fontWeight", label: "Ketebalan Font", type: "number" as const },
    ],
  },
  RichText: { label: "Rich Text", fields: [{ name: "html", label: "Konten HTML", type: "textarea" as const }] },
  Image: {
    label: "Gambar",
    fields: [
      { name: "src", label: "URL Gambar", type: "text" as const },
      { name: "alt", label: "Alt Text", type: "text" as const },
      { name: "width", label: "Lebar", type: "number" as const },
      { name: "height", label: "Tinggi", type: "number" as const },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 12 },
    ],
  },
  Button: {
    label: "Tombol",
    fields: [
      { name: "text", label: "Teks", type: "text" as const, defaultValue: "Tombol" },
      { name: "href", label: "Link", type: "text" as const },
      { name: "variant", label: "Varian", type: "select" as const, options: [{ value: "primary", label: "Primer" }, { value: "outline", label: "Outline" }] },
      { name: "bgColor", label: "Warna Latar", type: "color" as const },
      { name: "textColor", label: "Warna Teks", type: "color" as const },
      { name: "fontSize", label: "Ukuran Font (px)", type: "number" as const, defaultValue: 16 },
      { name: "height", label: "Tinggi (px)", type: "number" as const, defaultValue: 52 },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 8 },
      { name: "paddingH", label: "Padding Horizontal (px)", type: "number" as const, defaultValue: 26 },
    ],
  },
  Section: {
    label: "Section",
    fields: [
      { name: "content", label: "Konten", type: "slot" as const },
      { name: "padding", label: "Padding (px)", type: "number" as const, defaultValue: 24 },
      { name: "background", label: "Warna Latar", type: "color" as const },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 14 },
      { name: "border", label: "Border", type: "text" as const },
      { name: "boxShadow", label: "Box Shadow", type: "text" as const },
    ],
  },
  Div: {
    label: "Div / Container",
    fields: [
      { name: "content", label: "Konten", type: "slot" as const },
      { name: "display", label: "Display", type: "select" as const, options: [{ value: "block", label: "Block" }, { value: "flex", label: "Flex" }, { value: "grid", label: "Grid" }, { value: "inline-block", label: "Inline Block" }], defaultValue: "block" },
      { name: "direction", label: "Arah Flex", type: "select" as const, options: [{ value: "row", label: "Baris" }, { value: "column", label: "Kolom" }], defaultValue: "row" },
      { name: "gap", label: "Gap (px)", type: "number" as const },
      { name: "alignItems", label: "Align Items", type: "select" as const, options: [{ value: "", label: "Default" }, { value: "center", label: "Center" }, { value: "flex-start", label: "Start" }, { value: "flex-end", label: "End" }, { value: "stretch", label: "Stretch" }] },
      { name: "justifyContent", label: "Justify Content", type: "select" as const, options: [{ value: "", label: "Default" }, { value: "center", label: "Center" }, { value: "space-between", label: "Space Between" }, { value: "space-around", label: "Space Around" }, { value: "flex-start", label: "Start" }, { value: "flex-end", label: "End" }] },
      { name: "flexWrap", label: "Flex Wrap", type: "select" as const, options: [{ value: "", label: "Default" }, { value: "wrap", label: "Wrap" }, { value: "nowrap", label: "No Wrap" }] },
      { name: "gridCols", label: "Jumlah Kolom Grid", type: "number" as const },
      { name: "template", label: "Grid Template (mis: minmax(0,1fr) 445px)", type: "text" as const },
      { name: "padding", label: "Padding (px)", type: "number" as const },
      { name: "background", label: "Warna Latar", type: "color" as const },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const },
      { name: "border", label: "Border", type: "text" as const },
      { name: "boxShadow", label: "Box Shadow", type: "text" as const },
      { name: "width", label: "Lebar", type: "text" as const },
      { name: "maxWidth", label: "Lebar Maks", type: "text" as const },
      { name: "minHeight", label: "Tinggi Min", type: "text" as const },
    ],
  },
  Columns: {
    label: "Kolom",
    fields: [
      { name: "columnCount", label: "Jumlah Kolom (1-4)", type: "number" as const, defaultValue: 2 },
      { name: "gap", label: "Jarak (px)", type: "number" as const, defaultValue: 28 },
      { name: "template", label: "Grid Template (mis: minmax(0,1fr) 445px)", type: "text" as const },
      { name: "col1", label: "Kolom 1", type: "slot" as const },
      { name: "col2", label: "Kolom 2", type: "slot" as const },
      { name: "col3", label: "Kolom 3", type: "slot" as const },
      { name: "col4", label: "Kolom 4", type: "slot" as const },
    ],
  },
  Spacer: { label: "Spasi", fields: [{ name: "height", label: "Tinggi (px)", type: "number" as const, defaultValue: 24 }] },
  Divider: { label: "Pemisah", fields: [] },
  ArticleList: {
    label: "Daftar Artikel",
    fields: [
      { name: "limit", label: "Jumlah", type: "number" as const, defaultValue: 6 },
      { name: "columns", label: "Kolom", type: "number" as const, defaultValue: 2 },
      { name: "showImage", label: "Tampilkan Gambar", type: "checkbox" as const },
      { name: "titleSize", label: "Ukuran Judul (px)", type: "number" as const, defaultValue: 17 },
      { name: "excerptSize", label: "Ukuran Ringkasan (px)", type: "number" as const, defaultValue: 14 },
    ],
  },
  ArticleDetail: { label: "Detail Artikel", fields: [] },
  CategoryList: { label: "Daftar Kategori", fields: [] },
  Statistics: {
    label: "Statistik Penduduk",
    fields: [
      { name: "title", label: "Judul Chart", type: "text" as const, defaultValue: "Jumlah Penduduk" },
      { name: "totalLabel", label: "Label Total", type: "text" as const, defaultValue: "Total Penduduk" },
      { name: "suffix", label: "Satuan", type: "text" as const, defaultValue: "Jiwa" },
    ],
  },
  VillageApparatus: { label: "Aparatur Desa", fields: [{ name: "limit", label: "Jumlah", type: "number" as const, defaultValue: 4 }] },
  LoginWidget: {
    label: "Widget Login",
    fields: [
      { name: "title", label: "Judul", type: "text" as const, defaultValue: "Masuk" },
      { name: "selfServiceText", label: "Teks Layanan Mandiri", type: "text" as const, defaultValue: "Layanan Mandiri" },
      { name: "selfServiceLink", label: "Link Layanan Mandiri", type: "text" as const, defaultValue: "/layanan-mandiri" },
      { name: "adminText", label: "Teks Admin", type: "text" as const, defaultValue: "Admin" },
      { name: "adminLink", label: "Link Admin", type: "text" as const, defaultValue: "/siteman" },
      { name: "selfColor", label: "Warna Tombol Mandiri", type: "text" as const, defaultValue: "linear-gradient(135deg,#3daa46,#2b923e)" },
      { name: "adminColor", label: "Warna Tombol Admin", type: "text" as const, defaultValue: "linear-gradient(135deg,#006c50,#00513d)" },
    ],
  },
  DateCard: { label: "Kartu Tanggal", fields: [] },
  CategoryWidget: {
    label: "Widget Kategori",
    fields: [{ name: "limit", label: "Jumlah", type: "number" as const, defaultValue: 6 }],
  },
  SidebarWidget: {
    label: "Widget Sidebar",
    fields: [
      { name: "title", label: "Judul", type: "text" as const },
      { name: "icon", label: "Icon FA", type: "text" as const },
      { name: "content", label: "Konten HTML", type: "textarea" as const },
    ],
  },
  SearchBar: {
    label: "Pencarian",
    fields: [
      { name: "placeholder", label: "Placeholder", type: "text" as const, defaultValue: "Cari artikel, berita, informasi..." },
      { name: "height", label: "Tinggi (px)", type: "number" as const, defaultValue: 58 },
      { name: "buttonWidth", label: "Lebar Tombol (px)", type: "number" as const, defaultValue: 94 },
      { name: "bgColor", label: "Warna Tombol", type: "text" as const, defaultValue: "linear-gradient(135deg,#138943,#00633f)" },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 10 },
    ],
  },
  WidgetArea: { label: "Area Widget", fields: [{ name: "text", label: "Teks", type: "text" as const, defaultValue: "Widget Area" }] },
  Text: {
    label: "Teks",
    fields: [
      { name: "text", label: "Teks", type: "text" as const, defaultValue: "Teks paragraf" },
      { name: "as", label: "Elemen HTML", type: "select" as const, options: [{ value: "p", label: "Paragraf (p)" }, { value: "span", label: "Span (inline)" }, { value: "strong", label: "Tebal (strong)" }, { value: "em", label: "Miring (em)" }, { value: "small", label: "Kecil (small)" }, { value: "mark", label: "Sorot (mark)" }, { value: "u", label: "Garis Bawah (u)" }, { value: "s", label: "Coret (s)" }], defaultValue: "p" },
      { name: "align", label: "Rata", type: "select" as const, options: [{ value: "left", label: "Kiri" }, { value: "center", label: "Tengah" }, { value: "right", label: "Kanan" }], defaultValue: "left" },
      { name: "color", label: "Warna", type: "color" as const },
      { name: "fontSize", label: "Ukuran Font (px)", type: "number" as const, defaultValue: 16 },
      { name: "fontWeight", label: "Ketebalan Font", type: "number" as const, defaultValue: 400 },
      { name: "lineHeight", label: "Line Height", type: "number" as const, defaultValue: 1.7 },
      { name: "fontStyle", label: "Gaya Font", type: "select" as const, options: [{ value: "", label: "Normal" }, { value: "italic", label: "Italic" }] },
      { name: "textDecoration", label: "Dekorasi", type: "select" as const, options: [{ value: "", label: "Tidak Ada" }, { value: "underline", label: "Garis Bawah" }, { value: "line-through", label: "Coret" }] },
      { name: "letterSpacing", label: "Jarak Huruf (px)", type: "number" as const },
      { name: "textTransform", label: "Transformasi", type: "select" as const, options: [{ value: "", label: "Tidak Ada" }, { value: "uppercase", label: "KAPITAL" }, { value: "lowercase", label: "kecil" }, { value: "capitalize", label: "Kapital Awal" }] },
    ],
  },
  Icon: {
    label: "Ikon",
    fields: [
      { name: "icon", label: "Ikon FA", type: "text" as const, defaultValue: "fa-star" },
      { name: "size", label: "Ukuran Ikon (px)", type: "number" as const, defaultValue: 25 },
      { name: "color", label: "Warna Ikon", type: "color" as const },
      { name: "bgColor", label: "Warna Latar", type: "color" as const },
      { name: "boxSize", label: "Ukuran Kotak (px)", type: "number" as const, defaultValue: 50 },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 9 },
    ],
  },
  Logo: {
    label: "Logo",
    fields: [
      { name: "src", label: "URL Logo", type: "text" as const },
      { name: "size", label: "Ukuran (px)", type: "number" as const, defaultValue: 58 },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 0 },
    ],
  },
  LoginButton: {
    label: "Tombol Login",
    fields: [
      { name: "text", label: "Teks", type: "text" as const, defaultValue: "Layanan Mandiri" },
      { name: "href", label: "Link", type: "text" as const, defaultValue: "/layanan-mandiri" },
      { name: "icon", label: "Ikon FA", type: "text" as const, defaultValue: "fa-user" },
      { name: "bgColor", label: "Warna Latar", type: "color" as const, defaultValue: "linear-gradient(135deg,#3daa46,#2b923e)" },
      { name: "textColor", label: "Warna Teks", type: "color" as const, defaultValue: "#fff" },
      { name: "height", label: "Tinggi (px)", type: "number" as const, defaultValue: 53 },
      { name: "fontSize", label: "Ukuran Font (px)", type: "number" as const, defaultValue: 16 },
      { name: "borderRadius", label: "Border Radius (px)", type: "number" as const, defaultValue: 7 },
    ],
  },
  StatBar: {
    label: "Bar Statistik",
    fields: [
      { name: "label", label: "Label", type: "text" as const, defaultValue: "Laki-laki" },
      { name: "value", label: "Nilai", type: "number" as const, defaultValue: 600 },
      { name: "maxValue", label: "Nilai Maks", type: "number" as const, defaultValue: 1200 },
      { name: "gradient", label: "Warna Bar", type: "text" as const, defaultValue: "linear-gradient(180deg,#73b9f5,#4497dc)" },
      { name: "barWidth", label: "Lebar Bar (px)", type: "number" as const, defaultValue: 48 },
      { name: "chartHeight", label: "Tinggi Chart (px)", type: "number" as const, defaultValue: 130 },
    ],
  },
  PersonCard: {
    label: "Kartu Personil",
    fields: [
      { name: "name", label: "Nama", type: "text" as const, defaultValue: "Nama Pamong" },
      { name: "jabatan", label: "Jabatan", type: "text" as const, defaultValue: "Jabatan" },
      { name: "foto", label: "URL Foto", type: "text" as const },
      { name: "avatarSize", label: "Ukuran Avatar (px)", type: "number" as const, defaultValue: 46 },
      { name: "nameSize", label: "Ukuran Nama (px)", type: "number" as const, defaultValue: 14 },
      { name: "titleSize", label: "Ukuran Jabatan (px)", type: "number" as const, defaultValue: 12 },
    ],
  },
  CategoryItem: {
    label: "Item Kategori",
    fields: [
      { name: "name", label: "Nama", type: "text" as const, defaultValue: "Kategori" },
      { name: "link", label: "Link", type: "text" as const, defaultValue: "#" },
      { name: "count", label: "Jumlah", type: "number" as const },
      { name: "showCount", label: "Tampilkan Jumlah", type: "select" as const, options: [{ value: "true", label: "Ya" }, { value: "", label: "Tidak" }], defaultValue: "" },
      { name: "color", label: "Warna", type: "text" as const, defaultValue: "#5f6978" },
      { name: "fontSize", label: "Ukuran Font (px)", type: "number" as const, defaultValue: 15 },
    ],
  },
  ArticleCard: {
    label: "Kartu Artikel",
    fields: [
      { name: "image", label: "URL Gambar", type: "text" as const },
      { name: "category", label: "Kategori", type: "text" as const, defaultValue: "Artikel" },
      { name: "title", label: "Judul", type: "text" as const, defaultValue: "Judul Artikel" },
      { name: "excerpt", label: "Ringkasan", type: "textarea" as const },
      { name: "link", label: "Link", type: "text" as const, defaultValue: "#" },
      { name: "showImage", label: "Tampilkan Gambar", type: "select" as const, options: [{ value: "true", label: "Ya" }, { value: "", label: "Tidak" }], defaultValue: "true" },
      { name: "imageHeight", label: "Tinggi Gambar (px)", type: "number" as const, defaultValue: 118 },
      { name: "imageWidth", label: "Lebar Gambar (px)", type: "number" as const, defaultValue: 145 },
      { name: "titleSize", label: "Ukuran Judul (px)", type: "number" as const, defaultValue: 17 },
      { name: "excerptSize", label: "Ukuran Ringkasan (px)", type: "number" as const, defaultValue: 14 },
    ],
  },
  SocialLinks: {
    label: "Link Sosial",
    fields: [
      { name: "items", label: "Items (JSON)", type: "textarea" as const, defaultValue: JSON.stringify([
        { name: "Facebook", link: "#", icon: "fa-facebook" },
        { name: "Instagram", link: "#", icon: "fa-instagram" },
        { name: "YouTube", link: "#", icon: "fa-youtube" },
      ], null, 2) },
      { name: "iconColor", label: "Warna Ikon", type: "text" as const, defaultValue: "#08703f" },
      { name: "iconSize", label: "Ukuran Ikon (px)", type: "number" as const, defaultValue: 38 },
    ],
  },
}

// ── Block Render Functions ──────────────────────────────────────────

export const BLOCK_RENDERERS: Record<string, (props: any) => ReactNode> = {
  SiteHeader: SiteHeaderBlock,
  Navigation: NavigationBlock,
  RunningText: RunningTextBlock,
  HeroCard: HeroCardBlock,
  SectionHeader: SectionHeaderBlock,
  FeaturedArticle: FeaturedArticleBlock,
  Heading: HeadingBlock,
  RichText: RichTextBlock,
  Image: ImageBlock,
  Button: ButtonBlock,
  Section: SectionBlock,
  Div: DivBlock,
  Columns: ColumnsBlock,
  Spacer: SpacerBlock,
  Divider: DividerBlock,
  ArticleList: ArticleListBlock,
  ArticleDetail: ArticleDetailBlock,
  CategoryList: CategoryListBlock,
  Statistics: StatisticsBlock,
  VillageApparatus: VillageApparatusBlock,
  SiteFooter: SiteFooterBlock,
  LoginWidget: LoginWidgetBlock,
  DateCard: DateCardBlock,
  CategoryWidget: CategoryWidgetBlock,
  SidebarWidget: SidebarWidgetBlock,
  SearchBar: SearchBarBlock,
  WidgetArea: WidgetAreaBlock,
  SocialLinks: SocialLinksBlock,
  Text: TextBlock,
  Icon: IconBlock,
  Logo: LogoBlock,
  LoginButton: LoginButtonBlock,
  StatBar: StatBarBlock,
  PersonCard: PersonCardBlock,
  CategoryItem: CategoryItemBlock,
  ArticleCard: ArticleCardBlock,
}
