"use client"

import { ReactNode } from "react"
import type { ThemeResolution } from "@/lib/publicTheme"
import type { PublicThemeContext } from "./puck/types"
import { renderPuckLayout } from "./puck/config"

type Props = {
  routeKey: string
  renderer: "legacy" | "puck" | "puck-fallback"
  context: PublicThemeContext
  data?: { content: any[] } | null
  legacyChildren?: ReactNode
}

export default function PublicThemeRenderer({
  routeKey,
  renderer,
  context,
  data,
  legacyChildren,
}: Props) {
  // Legacy mode — render existing JSX unchanged
  if (renderer === "legacy") {
    return <>{legacyChildren}</>
  }

  // Puck mode with data — render from saved layout
  if (renderer === "puck" && data?.content) {
    return <>{renderPuckLayout(data, context)}</>
  }

  // Puck fallback — no layout data yet for this route
  return (
    <div style={{
      border: "2px dashed #f59e0b",
      borderRadius: 12,
      padding: 40,
      textAlign: "center",
      color: "#92400e",
      background: "#fffbeb",
      margin: "24px 0",
    }}>
      <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
        Halaman belum memiliki tata letak Puck
      </p>
      <p style={{ fontSize: 14, margin: 0 }}>
        Silakan edit melalui{" "}
        <a href="/theme/customize" style={{ color: "#3b82f6", fontWeight: 600 }}>
          Kustomisasi Tema
        </a>
      </p>
    </div>
  )
}
