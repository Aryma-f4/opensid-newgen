import { existsSync } from "node:fs"
import { isAbsolute, relative, resolve } from "node:path"
import { prisma } from "../src/lib/prisma"
import { mapRoute } from "../src/lib/adminRouteRegistry"
import { isVisibleMenu } from "../src/lib/adminMenuVisibility"

async function main() {
  const adminRoot = resolve(process.cwd(), "src", "app", "(admin)")
  const fallbackPage = resolve(adminRoot, "[...mod]", "page.tsx")
  const rows = (await prisma.$queryRaw`
    SELECT modul, url, hidden
    FROM setting_modul
    WHERE aktif = 1 AND url <> ''
    ORDER BY urut ASC
  `) as Array<{ modul: string; url: string; hidden: number }>
  const visibleRows = rows.filter((row) => isVisibleMenu(Number(row.hidden)))
  const unresolved = visibleRows.flatMap((row) => {
    const route = mapRoute(row.url)
    const relativeRoute = route?.replace(/^\//, "")
    const pagePath = relativeRoute ? resolve(adminRoot, relativeRoute, "page.tsx") : ""
    const relativePage = pagePath ? relative(adminRoot, pagePath) : ""
    const insideAdminRoot = Boolean(
      relativePage
      && !relativePage.startsWith("..")
      && !isAbsolute(relativePage),
    )
    const isFallback = pagePath === fallbackPage
    const resolved = insideAdminRoot && !isFallback && existsSync(pagePath)
    const reason = !insideAdminRoot
      ? "outside-admin-root"
      : isFallback
        ? "fallback"
        : "fallback-or-missing"
    return resolved ? [] : [{ ...row, route, reason }]
  })
  if (unresolved.length === 0) {
    console.log("All active admin menu URLs resolve.")
    return
  }
  for (const row of unresolved) {
    console.error(`${row.modul} (${row.url} -> ${row.route}; ${row.reason})`)
  }
  process.exitCode = 1
}

main().finally(() => prisma.$disconnect())
