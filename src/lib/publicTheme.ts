import { prisma } from "./prisma"

export type ThemeMode = "legacy" | "puck"

export type ThemeResolution = {
  mode: ThemeMode
  themeId?: bigint
  renderer?: string | null
}

/**
 * Resolve the active theme renderer mode for the current public config.
 * Returns "legacy" if no active theme or renderer is null/legacy.
 */
export async function resolvePublicTheme(configId: number = 1): Promise<ThemeResolution> {
  const activeTheme = await prisma.theme.findFirst({
    where: { config_id: configId, status: 1 },
    orderBy: { id: "desc" },
    select: { id: true, renderer: true },
  })

  if (!activeTheme || !activeTheme.renderer || activeTheme.renderer === "legacy") {
    return { mode: "legacy" }
  }

  return { mode: "puck", themeId: activeTheme.id, renderer: activeTheme.renderer }
}

/**
 * Load a validated Puck layout for a given theme/route.
 * Returns null if none found or if theme is legacy.
 */
export async function loadThemeLayout(
  configId: number,
  themeId: bigint | undefined,
  routeKey: string,
): Promise<{ content: any[] } | null> {
  if (!themeId) return null

  const layout = await prisma.theme_page_layouts.findFirst({
    where: { config_id: configId, theme_id: themeId, route_key: routeKey },
  })

  if (!layout?.puck_data) return null

  // Validate and return parseable data
  try {
    const data = layout.puck_data as any
    if (data?.content && Array.isArray(data.content)) {
      return data as { content: any[] }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Determine if the current route key is a public Puck route.
 */
export function selectPublicRenderer(
  resolution: ThemeResolution,
  routeKey: string,
): "legacy" | "puck" | "puck-fallback" {
  if (resolution.mode === "legacy") return "legacy"
  if (["home", "article-detail", "category-list", "layanan-mandiri"].includes(routeKey)) {
    return "puck"
  }
  return "puck-fallback"
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/siteman")
}
