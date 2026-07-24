import { existsSync } from "node:fs"
import { join } from "node:path"
import { prisma } from "../src/lib/prisma"
import { mapRoute } from "../src/lib/adminRouteRegistry"
import { isVisibleMenu } from "../src/lib/adminMenuVisibility"

async function main() {
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
    const pagePath = relativeRoute ? join(process.cwd(), "src", "app", "(admin)", relativeRoute, "page.tsx") : ""
    return pagePath && existsSync(pagePath) ? [] : [{ ...row, route }]
  })
  if (unresolved.length === 0) {
    console.log("All active admin menu URLs resolve.")
    return
  }
  for (const row of unresolved) console.error(`${row.modul} (${row.url} -> ${row.route})`)
  process.exitCode = 1
}

main().finally(() => prisma.$disconnect())
