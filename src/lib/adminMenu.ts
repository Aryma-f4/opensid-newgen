import { prisma } from "@/lib/prisma"
import { buildAdminMenu, type Modul, type RawAdminMenuRow } from "./adminMenuTree"

export { mapRoute } from "./adminRouteRegistry"
export type { Modul } from "./adminMenuTree"

export async function getAdminMenu(): Promise<Modul[]> {
  const rows = await prisma.$queryRaw<RawAdminMenuRow[]>`
    SELECT id, modul, slug, url, ikon, urut, parent, hidden
    FROM setting_modul
    WHERE aktif = 1
    ORDER BY urut ASC
  `

  return buildAdminMenu(rows)
}
