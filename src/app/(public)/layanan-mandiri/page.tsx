import Link from "next/link"
import { resolvePublicTheme, loadThemeLayout, buildPublicContext } from "@/lib/publicTheme"
import PublicThemeRenderer from "@/components/public/PublicThemeRenderer"

export const dynamic = "force-dynamic"

export default async function LayananMandiriPage() {
  const theme = await resolvePublicTheme(1)

  if (theme.mode === "puck") {
    const [layout, ctx] = await Promise.all([
      loadThemeLayout(1, theme.themeId, "layanan-mandiri"),
      buildPublicContext("layanan-mandiri"),
    ])
    return (
      <PublicThemeRenderer
        routeKey="layanan-mandiri"
        renderer={layout ? "puck" : "puck-fallback"}
        context={ctx}
        data={layout}
      />
    )
  }

  return (
    <section className="public-card">
      <h1 className="public-title">Layanan Mandiri</h1>
      <div className="public-content">
        <p>
          Halaman layanan mandiri sedang disiapkan di versi Next.js. Gunakan menu admin jika perlu mengelola layanan surat atau data warga.
        </p>
      </div>
      <Link href="/" className="public-back">
        <i className="fa fa-arrow-left" /> Kembali ke Beranda
      </Link>
    </section>
  )
}
