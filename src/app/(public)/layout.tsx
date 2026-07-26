import PublicSiteShell from "@/components/public/PublicSiteShell"
import { resolvePublicTheme } from "@/lib/publicTheme"

export const dynamic = "force-dynamic"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = await resolvePublicTheme(1)

  // Puck mode: pages render their own full layouts (header/nav/footer are Puck blocks)
  if (theme.mode === "puck") {
    return (
      <>
        <link rel="stylesheet" href="/assets/bootstrap/css/font-awesome.min.css" />
        <main style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top left, rgba(19,133,75,.08), transparent 34rem), linear-gradient(180deg, #fbfdfc 0%, #f4f7f5 100%)",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          color: "#182033",
        }}>
          <div style={{ width: "min(1360px, calc(100% - 80px))", margin: "0 auto", padding: "24px 0 18px" }}>
            {children}
          </div>
        </main>
      </>
    )
  }

  // Legacy mode: static shell
  return <PublicSiteShell>{children}</PublicSiteShell>
}
