"use client"

import { useState, useCallback, useRef, useEffect } from "react"

type Template = { id: number; name: string; description?: string; html_content?: string; css_content?: string; js_content?: string; is_active: number }
type Widget = { id: number; name: string; widget_key: string; type: string; region: string; sort_order: number; title?: string; content?: string; is_active: number }
type Region = { id: number; name: string; label?: string; description?: string; max_widgets: number }

const PREVIEW_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export default function ThemeCustomizer({ templates, widgets, regions }: { templates: Template[]; widgets: Widget[]; regions: Region[] }) {
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(templates.find((t) => t.is_active) || templates[0] || null)
  const [cssCode, setCssCode] = useState(activeTemplate?.css_content || "")
  const [jsCode, setJsCode] = useState(activeTemplate?.js_content || "")
  const [htmlCode, setHtmlCode] = useState(activeTemplate?.html_content || "")
  const [previewUrl, setPreviewUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"css" | "js" | "html" | "widgets">("css")
  const [localWidgets, setLocalWidgets] = useState<Widget[]>(widgets)
  const [dragWidget, setDragWidget] = useState<Widget | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Show toast
  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Update preview URL when CSS/JS changes (debounced)
  const updatePreview = useCallback((css: string, js: string, html: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const encoded = encodeURIComponent(css)
      const previewPath = `/preview?css=${encoded}&ts=${Date.now()}`
      setPreviewUrl(previewPath)
    }, 500)
  }, [])

  useEffect(() => {
    updatePreview(cssCode, jsCode, htmlCode)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [cssCode, jsCode, htmlCode, updatePreview])

  useEffect(() => {
    if (!previewUrl) return
    const iframe = iframeRef.current
    if (!iframe) return
    // Inject custom CSS into iframe after load
    const inject = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return
        // Remove old style
        const old = doc.getElementById("osid-custom-css")
        if (old) old.remove()
        // Inject new style
        const style = doc.createElement("style")
        style.id = "osid-custom-css"
        style.textContent = cssCode
        doc.head?.appendChild(style)
      } catch {
        // Cross-origin — ignore
      }
    }
    iframe.addEventListener("load", inject)
    return () => iframe.removeEventListener("load", inject)
  }, [previewUrl, cssCode])

  async function saveTemplate() {
    if (!activeTemplate) return
    setSaving(true)
    try {
      const res = await fetch(`/api/theme/templates/${activeTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ css_content: cssCode, js_content: jsCode, html_content: htmlCode }),
      })
      if (!res.ok) throw new Error(await res.text())
      showToast("success", "Template berhasil disimpan")
    } catch (e: any) {
      showToast("error", e.message || "Gagal menyimpan")
    } finally { setSaving(false) }
  }

  async function activateTemplate(t: Template) {
    setActiveTemplate(t)
    setCssCode(t.css_content || "")
    setJsCode(t.js_content || "")
    setHtmlCode(t.html_content || "")
    try {
      // Deactivate all, activate selected
      await Promise.all(templates.map((tmpl) =>
        fetch(`/api/theme/templates/${tmpl.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: tmpl.id === t.id ? 1 : 0 }),
        })
      ))
      showToast("success", `Tema "${t.name}" diaktifkan`)
    } catch { /* ignore */ }
  }

  // Drag and drop handlers
  function handleDragStart(w: Widget) { setDragWidget(w) }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  function handleDrop(region: string) {
    if (!dragWidget) return
    const updated = localWidgets.map((w) =>
      w.id === dragWidget.id ? { ...w, region, sort_order: localWidgets.filter((x) => x.region === region).length } : w
    )
    setLocalWidgets(updated)
    setDragWidget(null)
    // Persist
    fetch(`/api/theme/widgets/${dragWidget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, sort_order: localWidgets.filter((x) => x.region === region).length }),
    }).catch(() => {})
  }

  return (
    <div className="theme-customizer" style={{ display: "flex", gap: 0, height: "calc(100vh - 120px)", margin: "-20px -24px" }}>
      {/* Left sidebar — Controls */}
      <div className="customizer-sidebar" style={{ width: 360, minWidth: 360, background: "#1e293b", color: "#e2e8f0", overflowY: "auto", borderRight: "1px solid #334155" }}>
        <div style={{ padding: 16 }}>
          {/* Template selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "#94a3b8", display: "block", marginBottom: 6 }}>Template Tema</label>
            <select
              value={activeTemplate?.id || ""}
              onChange={(e) => {
                const t = templates.find((x) => x.id === parseInt(e.target.value))
                if (t) activateTemplate(t)
              }}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #475569", background: "#334155", color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} {t.is_active ? "(Aktif)" : ""}</option>
              ))}
            </select>
          </div>

          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid #334155", paddingBottom: 8 }}>
            {[
              { key: "css", label: "CSS" },
              { key: "js", label: "JavaScript" },
              { key: "html", label: "HTML" },
              { key: "widgets", label: "Widget" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: "6px 14px", borderRadius: 6, border: 0, cursor: "pointer",
                  background: activeTab === tab.key ? "#3b82f6" : "transparent",
                  color: activeTab === tab.key ? "#fff" : "#94a3b8",
                  fontSize: 12, fontWeight: 600, transition: "all .15s",
                }}
              >{tab.label}</button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "css" && (
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Custom CSS — perubahan terlihat real-time di preview</p>
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                placeholder="/* Tulis CSS kustom Anda di sini */"
                style={{
                  width: "100%", minHeight: 400, padding: 14, borderRadius: 6,
                  fontFamily: "'Consolas','Monaco','Courier New',monospace",
                  fontSize: 13, lineHeight: 1.6, background: "#0f172a", color: "#e2e8f0",
                  border: "1px solid #334155", resize: "vertical", tabSize: 2,
                }}
              />
            </div>
          )}

          {activeTab === "js" && (
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Custom JavaScript</p>
              <textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                placeholder="// Tulis JavaScript kustom di sini"
                style={{
                  width: "100%", minHeight: 400, padding: 14, borderRadius: 6,
                  fontFamily: "'Consolas','Monaco','Courier New',monospace",
                  fontSize: 13, lineHeight: 1.6, background: "#0f172a", color: "#e2e8f0",
                  border: "1px solid #334155", resize: "vertical", tabSize: 2,
                }}
              />
            </div>
          )}

          {activeTab === "html" && (
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Custom HTML — akan disisipkan di footer</p>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder="<!-- Tulis HTML kustom di sini -->"
                style={{
                  width: "100%", minHeight: 400, padding: 14, borderRadius: 6,
                  fontFamily: "'Consolas','Monaco','Courier New',monospace",
                  fontSize: 13, lineHeight: 1.6, background: "#0f172a", color: "#e2e8f0",
                  border: "1px solid #334155", resize: "vertical", tabSize: 2,
                }}
              />
            </div>
          )}

          {activeTab === "widgets" && (
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>Drag widget antar region</p>
              {/* Widget regions */}
              {(regions.length > 0 ? regions : [
                { id: 0, name: "sidebar", label: "Sidebar", description: "Sidebar kanan", max_widgets: 10 },
                { id: 1, name: "header", label: "Header", description: "Bagian atas", max_widgets: 5 },
                { id: 2, name: "footer", label: "Footer", description: "Bagian bawah", max_widgets: 5 },
              ]).map((region) => {
                const regionWidgets = localWidgets.filter((w) => w.region === region.name)
                return (
                  <div key={region.name} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
                      {region.label || region.name}
                      <span style={{ fontSize: 10, color: "#64748b", marginLeft: 6 }}>({regionWidgets.length})</span>
                    </div>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(region.name)}
                      style={{
                        minHeight: 40, padding: 6, borderRadius: 6,
                        background: "#334155", border: "2px dashed #475569",
                      }}
                    >
                      {regionWidgets.length === 0 && (
                        <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", padding: "8px 0" }}>
                          Drop widget di sini
                        </div>
                      )}
                      {regionWidgets.map((w) => (
                        <div
                          key={w.id}
                          draggable
                          onDragStart={() => handleDragStart(w)}
                          style={{
                            padding: "6px 10px", marginBottom: 4, borderRadius: 4,
                            background: "#1e293b", border: "1px solid #475569",
                            cursor: "grab", fontSize: 12, fontWeight: 500,
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}
                        >
                          <span>{w.name || w.widget_key}</span>
                          <span style={{ fontSize: 10, color: "#64748b" }}>{w.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Unplaced widgets */}
              {localWidgets.filter((w) => !["sidebar", "header", "footer"].includes(w.region)).length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>Belum ditempatkan</div>
                  <div style={{ minHeight: 40, padding: 6, borderRadius: 6, background: "#334155", border: "2px dashed #f59e0b" }}>
                    {localWidgets.filter((w) => !["sidebar", "header", "footer"].includes(w.region)).map((w) => (
                      <div key={w.id} draggable onDragStart={() => handleDragStart(w)} style={{ padding: "6px 10px", marginBottom: 4, borderRadius: 4, background: "#1e293b", border: "1px solid #475569", cursor: "grab", fontSize: 12, fontWeight: 500 }}>
                        {w.name || w.widget_key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save bar */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={saveTemplate} disabled={saving} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: 0,
              background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", opacity: saving ? 0.6 : 1,
            }}>
              {saving ? "Menyimpan..." : "Simpan Template"}
            </button>
            <a href="/theme/templates" style={{
              padding: "10px 16px", borderRadius: 8, border: "1px solid #475569",
              background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 600,
              textDecoration: "none", display: "inline-flex", alignItems: "center",
            }}>
              Kelola
            </a>
          </div>
        </div>
      </div>

      {/* Right panel — Preview */}
      <div className="customizer-preview" style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "8px 16px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748b" }}>
          <span>Live Preview — <strong>{activeTemplate?.name || "Tanpa template"}</strong></span>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Real-time
          </span>
        </div>
        <iframe
          ref={iframeRef}
          src={previewUrl || "/"}
          style={{ flex: 1, width: "100%", border: 0 }}
          title="Theme Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          padding: "12px 24px", borderRadius: 10,
          background: toast.type === "success" ? "#059669" : "#dc2626",
          color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 28px rgba(0,0,0,.15)",
          animation: "toastSlideIn .32s cubic-bezier(.34,1.56,.64,1)",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
