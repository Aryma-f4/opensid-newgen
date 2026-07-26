"use client"

import { useState, useEffect, useCallback } from "react"
import { Puck, Render, blocksPlugin, fieldsPlugin, outlinePlugin } from "@puckeditor/core"
import "@puckeditor/core/dist/index.css"
import { publicPuckComponents, PUCK_CATEGORIES } from "@/components/public/puck/config"
import { editorPreviewContext } from "@/components/public/puck/types"
import type { PublicRouteKey } from "@/lib/themePuck"
import { savePuckLayout, createVisualTheme, activateVisualTheme, restoreStarterLayout } from "./actions"

const PUCK_ROUTES: { key: PublicRouteKey; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "article-detail", label: "Artikel" },
  { key: "category-list", label: "Kategori" },
  { key: "layanan-mandiri", label: "Layanan Mandiri" },
]

type Theme = { id: string; nama: string; status: number; renderer?: string | null }

export default function PuckThemeEditor({
  themes,
  initialLayouts,
}: {
  themes: Theme[]
  initialLayouts: Record<string, any>
}) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [activeRoute, setActiveRoute] = useState<PublicRouteKey>("home")
  const [puckData, setPuckData] = useState<any>({ content: [] })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }, [])

  // Select first Puck theme or first theme
  useEffect(() => {
    if (!selectedTheme && themes.length > 0) {
      const puckTheme = themes.find((t) => t.renderer === "puck")
      setSelectedTheme(puckTheme || themes[0])
    }
  }, [themes, selectedTheme])

  // Load layout when theme or route changes
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
      const result = await savePuckLayout({
        themeId: selectedTheme.id,
        routeKey: activeRoute,
        data: puckData,
      })
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

  // Extract Puck sub-components at module level (they exist at runtime but not in types)
  const PuckPreview = (Puck as any).Preview
  const PuckFields = (Puck as any).Fields

  const isPuckTheme = selectedTheme?.renderer === "puck"
  const ctx = editorPreviewContext(activeRoute)

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
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
        background: "#fff", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap",
      }}>
        <select
          value={selectedTheme.id}
          onChange={(e) => {
            const t = themes.find((th) => th.id === e.target.value)
            if (t) setSelectedTheme(t)
          }}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, fontWeight: 600 }}
        >
          {themes.filter((t) => t.renderer === "puck").map((t) => (
            <option key={t.id} value={t.id}>{t.nama}{t.status === 1 ? " (Aktif)" : ""}</option>
          ))}
        </select>

        <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

        {PUCK_ROUTES.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveRoute(r.key)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: 0, cursor: "pointer",
              background: activeRoute === r.key ? "#3b82f6" : "#f1f5f9",
              color: activeRoute === r.key ? "#fff" : "#475569",
              fontSize: 13, fontWeight: 600,
            }}
          >{r.label}</button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Viewport controls */}
        {["desktop", "tablet", "mobile"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            style={{
              padding: "4px 10px", borderRadius: 4, border: "1px solid #d1d5db", cursor: "pointer",
              background: viewMode === mode ? "#e2e8f0" : "#fff", fontSize: 12,
            }}
          >{mode === "desktop" ? "🖥" : mode === "tablet" ? "📱" : "📲"}</button>
        ))}

        <button onClick={handleRestore} className="btn btn-default btn-sm" title="Kembalikan ke layout awal">↺</button>
        <button onClick={handleActivate} className="btn btn-success btn-sm">Aktifkan</button>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">{saving ? "Menyimpan..." : "Simpan"}</button>
      </div>

      {/* Puck Editor — full drag-and-drop visual builder */}
      <div style={{ flex: 1, position: "relative" }}>
        <Puck
          config={{
            components: publicPuckComponents,
            root: { fields: [] },
            categories: PUCK_CATEGORIES,
          } as any}
          data={puckData}
          onChange={(data: any) => {
            setPuckData(data)
          }}
          onPublish={async (data: any) => {
            setPuckData(data)
            await handleSave()
          }}
        >
          <PuckPreview>
            <div style={{
              maxWidth: viewMode === "mobile" ? 375 : viewMode === "tablet" ? 768 : "100%",
              margin: "0 auto", minHeight: "100%", background: "#fff",
              boxShadow: viewMode !== "desktop" ? "0 0 20px rgba(0,0,0,.1)" : "none",
            }}>
              <Render {...{ config: { components: publicPuckComponents }, data: puckData, context: ctx } as any} />
            </div>
          </PuckPreview>
          <PuckFields />
        </Puck>
      </div>

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
