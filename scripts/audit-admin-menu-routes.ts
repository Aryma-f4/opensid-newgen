import { existsSync } from "node:fs"
import { join } from "node:path"
import { prisma } from "../src/lib/prisma"
import { mapRoute } from "../src/lib/adminRouteRegistry"

async function main() {
  const rows = await prisma.setting_modul.findMany({
    where: { aktif: true, hidden: false, url: { not: "" } },
    select: { modul: true, url: true },
    orderBy: [{ urut: "asc" }]
  })
  const unresolved = rows.flatMap((row) => {
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
