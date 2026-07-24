import { prisma } from "@/lib/prisma"

export type Modul = {
  id: number
  modul: string
  slug: string | null
  url: string
  ikon: string | null
  urut: number | null
  parent: number
  children: Modul[]
}

// Route parity with original OpenSID: admin URL = "/" + CI controller url.
// Only method-suffixed URLs (e.g. "menu/clear") need normalizing to their page route.
const ROUTE_MAP: Record<string, string> = {
  "menu/clear": "/menu",
  "man_user/clear": "/man_user",
  setting_web: "/setting",
  "setting/aplikasi": "/setting",
}

export function mapRoute(url: string | null): string | null {
  if (!url) return null
  if (ROUTE_MAP[url]) return ROUTE_MAP[url]
  return `/${url}`
}

export async function getAdminMenu(): Promise<Modul[]> {
  const rows = await prisma.setting_modul.findMany({
    where: { aktif: true, hidden: false },
    orderBy: [{ urut: "asc" }],
  })

  const byParent = new Map<number, Modul[]>()
  for (const r of rows) {
    const p = r.parent ?? 0
    if (!byParent.has(p)) byParent.set(p, [])
    byParent.get(p)!.push({
      id: r.id,
      modul: r.modul,
      slug: r.slug,
      url: r.url,
      ikon: r.ikon,
      urut: r.urut,
      parent: p,
      children: [],
    })
  }

  function build(parent: number): Modul[] {
    const items = byParent.get(parent) ?? []
    for (const item of items) item.children = build(item.id)
    return items
  }

  return build(0)
}