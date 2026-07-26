"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Puck, usePuck, fieldsPlugin } from "@puckeditor/core"
import "@puckeditor/core/dist/index.css"
import { publicPuckComponents, PUCK_CATEGORIES } from "@/components/public/puck/config"
import { BUILTIN_PAGES, pagePathFor } from "@/lib/themePuck"
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
  const { appState, dispatch } = usePuck()
  const currentViewport = appState.ui.viewports.current.width
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
  const [puckData, setPuckData] = useState<any>({ content: [] })
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
      const puckTheme = themes.find((t) => t.renderer === "puck")
      setSelectedTheme(puckTheme || themes[0])
    }
  }, [themes, selectedTheme])

  useEffect(() => {
    if (!selectedTheme) return
    const key = `${selectedTheme.id}-${activeRoute}`
    const layout = initialLayouts[key]
    if (layout) {
      setPuckData(layout)
    } else {
      setPuckData({ content: [{ type: "SiteHeader", props: {} }, { type: "SiteFooter", props: {} }] })
    }
  }, [selectedTheme, activeRoute, initialLayouts])

  async function handleSave() {
    if (!selectedTheme) return
    setSaving(true)
    try {
      await savePuckLayout({ themeId: selectedTheme.id, routeKey: activeRoute, data: puckData })
      showToast("Layout berhasil disimpan")
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
      await createVisualTheme(newName)
      showToast("Tema visual berhasil dibuat")
      setNewName("")
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
    } catch (e: any) {
      showToast(e.message || "Gagal mengaktifkan")
    }
  }

  async function handleRestore() {
    if (!selectedTheme) return
    try {
      await restoreStarterLayout(selectedTheme.id, activeRoute)
      showToast("Layout awal dipulihkan")
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
          categories: Object.entries(PUCK_CATEGORIES).map(([label, components]) => ({ label, components })),
        } as any}
        data={puckData}
        onChange={(data: any) => setPuckData(data)}
        onPublish={async (data: any) => {
          setPuckData(data)
          await handleSave()
        }}
        plugins={[fieldsPlugin({ desktopSideBar: "right" })]}
        renderHeader={() => (
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
        )}
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
