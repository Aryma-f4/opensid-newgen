import { getConfig } from "@/lib/helpers"

export const dynamic = "force-dynamic"

export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ css?: string }> }) {
  const params = await searchParams
  const customCss = params.css ? decodeURIComponent(params.css) : ""
  const config = await getConfig()

  return (
    <section className="theme-preview">
      <style>{`
        .theme-preview { font-family: 'Source Sans Pro', sans-serif; min-height: 100vh; padding-top: 60px; }
        .theme-preview .preview-nav { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: linear-gradient(135deg, #18864d, #005a42); color: #fff; display: flex; align-items: center; padding: 0 20px; z-index: 1000; box-shadow: 0 2px 12px rgba(0,0,0,.12); }
        .theme-preview .preview-nav h2 { margin: 0; font-size: 18px; }
        .theme-preview .preview-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .theme-preview .preview-content { background: #fff; border-radius: 10px; padding: 24px; min-height: 400px; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
        .theme-preview .preview-footer { text-align: center; padding: 20px; color: #64748b; font-size: 13px; }
        .theme-preview .demo-widget { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
        .theme-preview .demo-widget h3 { margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #1e293b; }
        .theme-preview .demo-widget p { margin: 0; font-size: 13px; color: #64748b; }
        ${customCss}
      `}</style>
      <nav className="preview-nav">
        <h2>Preview: {config?.nama_desa ?? "OpenSID"}</h2>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>Theme Preview Mode</span>
      </nav>
      <div className="preview-container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          <div>
            <div className="preview-content">
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: "#1e293b" }}>Selamat Datang di {config?.nama_desa ?? "OpenSID"}</h1>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#475569", marginBottom: 20 }}>
                Website resmi {config?.nama_desa ?? "Desa"} — {config?.nama_kecamatan ? `Kec. ${config.nama_kecamatan}` : ""} {config?.nama_kabupaten ? `Kab. ${config.nama_kabupaten}` : ""}
              </p>
              <div style={{ background: "#f1f5f9", borderRadius: 8, padding: 20 }}>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                  Ini adalah tampilan pratinjau tema. CSS kustom akan diterapkan secara real-time.
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="demo-widget"><h3>Menu Kategori</h3><p>Artikel, Berita, Informasi</p></div>
            <div className="demo-widget"><h3>Statistik</h3><p>Total Penduduk: --</p></div>
            <div className="demo-widget"><h3>Aparatur Desa</h3><p>Perangkat desa aktif</p></div>
          </div>
        </div>
      </div>
      <div className="preview-footer">
        &copy; {new Date().getFullYear()} OpenSID — Theme Preview
      </div>
    </section>
  )
}
