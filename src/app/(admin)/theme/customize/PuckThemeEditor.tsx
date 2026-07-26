"use client"

// Silence React key warnings from Puck internal components (StaticLayerTreeItems, DropZoneEditInternal)
if (typeof window !== "undefined") {
  const origError = console.error
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : ""
    if (msg.includes("Each child in a list should have a unique \"key\" prop")) return
    origError.apply(console, args)
  }
}

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Puck, fieldsPlugin, createUsePuck } from "@puckeditor/core"
import "@puckeditor/core/dist/index.css"
const usePuckStore = createUsePuck()
import { publicPuckComponents, PUCK_CATEGORIES } from "@/components/public/puck/config"
import { deduplicatePuckLayout } from "@/components/public/puck/blocks"
import { BUILTIN_PAGES, pagePathFor, starterPuckData } from "@/lib/themePuck"
import { savePuckLayout, createVisualTheme, activateVisualTheme, restoreStarterLayout, createCustomPage } from "./actions"

const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: "100%" as const, height: "auto" as const },
}

type Theme = { id: string; nama: string; status: number; renderer?: string | null }
type PageTab = { key: string; label: string; path: string }

// ── Toolbar ─────────────────────────────────────────────────────────

function EditorToolbar({
  themes,
  selectedTheme,
  onSelectTheme,
  activeRoute,
  onSelectRoute,
  pages,
  onAddPage,
  isPreview,
  onTogglePreview,
  onSave,
  onRestore,
  onActivate,
  saving,
}: {
  themes: Theme[]
  selectedTheme: Theme
  onSelectTheme: (t: Theme) => void
  activeRoute: string
  onSelectRoute: (r: string) => void
  pages: PageTab[]
  onAddPage: () => void
  isPreview: boolean
  onTogglePreview: () => void
  onSave: () => void
  onRestore: () => void
  onActivate: () => void
  saving: boolean
}) {
  const appState = usePuckStore((s: any) => s.appState)
  const dispatch = usePuckStore((s: any) => s.dispatch)
  const currentViewport = appState?.ui?.viewports?.current?.width
  const activeMode =
    currentViewport === 375 ? "mobile" :
    currentViewport === 768 ? "tablet" : "desktop"

  function setViewport(mode: "mobile" | "tablet" | "desktop") {
    const vp = VIEWPORT_SIZES[mode]
    dispatch({
      type: "setUi",
      ui: { viewports: { current: { width: vp.width, height: vp.height }, controlsVisible: true, options: [] } } as any,
    })
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
      background: "#fff", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", minHeight: 48,
    }}>
      <select
        value={selectedTheme.id}
        onChange={(e) => { const t = themes.find((th) => th.id === e.target.value); if (t) onSelectTheme(t) }}
        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, fontWeight: 600 }}
      >
        {themes.filter((t) => t.renderer === "puck").map((t) => (
          <option key={t.id} value={t.id}>{t.nama}{t.status === 1 ? " (Aktif)" : ""}</option>
        ))}
      </select>

      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

      {pages.map((r) => (
        <button key={r.key} onClick={() => onSelectRoute(r.key)} title={r.path} style={{
          padding: "6px 14px", borderRadius: 6, border: 0, cursor: "pointer",
          background: activeRoute === r.key ? "#3b82f6" : "#f1f5f9",
          color: activeRoute === r.key ? "#fff" : "#475569", fontSize: 13, fontWeight: 600,
        }}>{r.label}</button>
      ))}
      <button onClick={onAddPage} title="Tambah halaman baru" style={{
        padding: "6px 12px", borderRadius: 6, border: "1px dashed #94a3b8", cursor: "pointer",
        background: "#fff", color: "#475569", fontSize: 13, fontWeight: 700,
      }}>＋</button>
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{pages.length} halaman</span>

      <div style={{ flex: 1 }} />

      {/* Viewport */}
      <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 6, padding: 2 }}>
        {(["desktop", "tablet", "mobile"] as const).map((mode) => (
          <button key={mode} onClick={() => setViewport(mode)} title={mode} style={{
            padding: "5px 12px", borderRadius: 4, border: 0, cursor: "pointer",
            background: activeMode === mode ? "#fff" : "transparent",
            boxShadow: activeMode === mode ? "0 1px 3px rgba(0,0,0,.12)" : "none",
            fontSize: 12, fontWeight: 600, color: activeMode === mode ? "#1e293b" : "#64748b",
          }}>{mode === "desktop" ? "🖥 Desktop" : mode === "tablet" ? "📱 Tablet" : "📲 Mobile"}</button>
        ))}
      </div>

      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

      {/* Edit / Preview */}
      <button onClick={() => {
        const next = !isPreview
        onTogglePreview()
        dispatch({
          type: "setUi",
          ui: { leftSideBarVisible: !next, rightSideBarVisible: !next } as any,
        })
      }} style={{
        padding: "6px 14px", borderRadius: 6, border: 0, cursor: "pointer",
        background: isPreview ? "#8b5cf6" : "#f1f5f9",
        color: isPreview ? "#fff" : "#475569", fontSize: 13, fontWeight: 600,
      }}>{isPreview ? "👁 Preview" : "✏️ Edit"}</button>

      <button onClick={onRestore} className="btn btn-default btn-sm" title="Kembalikan ke layout awal">↺</button>
      <button onClick={onActivate} className="btn btn-success btn-sm">Aktifkan</button>
      <button onClick={onSave} disabled={saving} className="btn btn-primary btn-sm">{saving ? "Menyimpan..." : "Simpan"}</button>
    </div>
  )
}

// ── Main Editor ──────────────────────────────────────────────────────

export default function PuckThemeEditor({
  themes,
  initialLayouts,
}: {
  themes: Theme[]
  initialLayouts: Record<string, any>
}) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [activeRoute, setActiveRoute] = useState<string>("home")
  // Derive puck data directly from selectedTheme + activeRoute + initialLayouts
  const puckKey = selectedTheme ? `${selectedTheme.id}-${activeRoute}` : ""
  const initialPuckData = puckKey && initialLayouts[puckKey]
    ? deduplicatePuckLayout(initialLayouts[puckKey])
    : { content: [{ type: "SiteHeader", props: {} }, { type: "SiteFooter", props: {} }] }
  const [puckData, setPuckData] = useState<any>(initialPuckData)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const router = useRouter()

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }, [])

  // Page tabs: builtin + custom pages found in saved layouts for this theme
  const builtinKeys = new Set(BUILTIN_PAGES.map((p) => p.key))
  const customPages: PageTab[] = selectedTheme
    ? Object.keys(initialLayouts)
        .filter((k) => k.startsWith(`${selectedTheme.id}-`))
        .map((k) => k.slice(`${selectedTheme.id}-`.length))
        .filter((rk) => !builtinKeys.has(rk))
        .map((rk) => ({ key: rk, label: rk.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), path: pagePathFor(rk) }))
    : []
  const pages: PageTab[] = [...BUILTIN_PAGES, ...customPages]

  useEffect(() => {
    if (!selectedTheme && themes.length > 0) {
      // Auto-select the ACTIVE theme, or first puck theme
      const activeTheme = themes.find((t) => t.status === 1 && t.renderer === "puck")
      const fallback = themes.find((t) => t.renderer === "puck") || themes[0]
      setSelectedTheme(activeTheme || fallback)
    }
  }, [themes, selectedTheme])

  // Sync puckData when theme/route changes or initialLayouts updates (e.g. after save)
  useEffect(() => {
    if (!selectedTheme) return
    const key = `${selectedTheme.id}-${activeRoute}`
    const layout = initialLayouts[key]
    setPuckData(deduplicatePuckLayout(layout || { content: [{ type: "SiteHeader", props: {} }, { type: "SiteFooter", props: {} }] }))
  }, [selectedTheme, activeRoute, initialLayouts])

  async function handleSave() {
    if (!selectedTheme) return
    setSaving(true)
    try {
      await savePuckLayout({ themeId: selectedTheme.id, routeKey: activeRoute, data: deduplicatePuckLayout(puckData) })
      showToast("Layout berhasil disimpan")
      router.refresh()
    } catch (e: any) {
      showToast(e.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await createVisualTheme(newName)
      showToast("Tema visual berhasil dibuat")
      setNewName("")
      // Select the new theme and route right away
      const newTheme = { id: res.themeId, nama: newName, status: 0, renderer: "puck" as const }
      setSelectedTheme(newTheme)
      setActiveRoute("home")
      router.refresh()
    } catch (e: any) {
      showToast(e.message || "Gagal membuat tema")
    } finally {
      setCreating(false)
    }
  }

  async function handleAddPage() {
    if (!selectedTheme) return
    const name = window.prompt("Nama halaman baru (mis: Tentang Kami, Profil Desa):")
    if (!name?.trim()) return
    try {
      const res = await createCustomPage(selectedTheme.id, name)
      showToast(`Halaman "${name}" dibuat — ${pagePathFor(res.routeKey)}`)
      setActiveRoute(res.routeKey)
      router.refresh()
    } catch (e: any) {
      showToast(e.message || "Gagal membuat halaman")
    }
  }

  async function handleActivate() {
    if (!selectedTheme) return
    try {
      await activateVisualTheme(selectedTheme.id)
      showToast("Tema diaktifkan")
      router.refresh()
    } catch (e: any) {
      showToast(e.message || "Gagal mengaktifkan")
    }
  }

  async function handleRestore() {
    if (!selectedTheme) return
    try {
      // Reset preview IMMEDIATELY with starter data, don't wait for DB
      const starter = starterPuckData(activeRoute)
      setPuckData(starter)
      // Then persist to DB server-side
      await restoreStarterLayout(selectedTheme.id, activeRoute)
      showToast("Layout awal dipulihkan")
      router.refresh()
    } catch (e: any) {
      showToast(e.message || "Gagal memulihkan")
    }
  }

  const isPuckTheme = selectedTheme?.renderer === "puck"

  if (!selectedTheme) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        <p>Belum ada tema. Buat tema visual baru untuk memulai.</p>
        <div style={{ marginTop: 16 }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama tema..." style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", marginRight: 8 }} />
          <button onClick={handleCreate} disabled={creating} className="btn btn-primary btn-sm">{creating ? "Membuat..." : "Buat Tema Visual"}</button>
        </div>
      </div>
    )
  }

  if (!isPuckTheme) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        <p><strong>{selectedTheme.nama}</strong> adalah tema legacy. Editor visual hanya untuk tema Puck.</p>
        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama tema baru..." style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db" }} />
          <button onClick={handleCreate} disabled={creating} className="btn btn-primary btn-sm">Buat Tema Visual</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
      <Puck
        config={{
          components: publicPuckComponents,
          root: { fields: [] },
          categories: Object.entries(PUCK_CATEGORIES).map(([label, components]) => ({ label: label, components })),
        } as any}
        data={puckData}
        onChange={(data: any) => { console.log("puck data", data?.content?.length); setPuckData(data) }}
        onPublish={async (data: any) => {
          setPuckData(data)
          await handleSave()
        }}
        plugins={[fieldsPlugin()]}
        overrides={{
          fieldTypes: {
            custom: function ColorField({ value, onChange }: any) {
              const inputRef = useRef(null)
              const swatchRef = useRef<HTMLDivElement>(null)
              const cur = value || "#000000"
              return (
                <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
                  <div style={{ position: "relative", width: 56, height: 42 }}>
                    <div ref={swatchRef} onClick={() => (inputRef.current as any)?.click()} style={{ width: 56, height: 42, border: "2px solid #d1d5db", borderRadius: 8, background: cur, cursor: "pointer" }} />
                    <input
                      ref={inputRef}
                      type="color"
                      defaultValue={cur}
                      // Update swatch DOM directly via native event — no React re-render
                      onInput={(e: any) => {
                        const el = swatchRef.current
                        if (el) el.style.background = e.target.value
                      }}
                      // Commit final value only on blur (picker closed)
                      onBlur={(e: any) => { onChange?.(e.target.value) }}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    />
                  </div>
                  <input
                    type="text"
                    defaultValue={cur.replace("#", "")}
                    onBlur={(e: any) => {
                      const v = e.target.value.trim()
                      if (v) onChange?.("#" + (v.startsWith("#") ? v.slice(1) : v))
                    }}
                    onKeyDown={(e: any) => { if (e.key === "Enter") e.currentTarget.blur() }}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 13 }}
                  />
                </div>
              )
            },
          } as any,
          header: () => (
            <EditorToolbar
              themes={themes}
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
              activeRoute={activeRoute}
              onSelectRoute={setActiveRoute}
              pages={pages}
              onAddPage={handleAddPage}
              isPreview={isPreview}
              onTogglePreview={() => setIsPreview(!isPreview)}
              onSave={handleSave}
              onRestore={handleRestore}
              onActivate={handleActivate}
              saving={saving}
            />
          ),
        }}
      />

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "12px 24px",
          borderRadius: 10, background: "#059669", color: "#fff",
          fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: "0 8px 28px rgba(0,0,0,.15)",
        }}>{toast}</div>
      )}
    </div>
  )
}
