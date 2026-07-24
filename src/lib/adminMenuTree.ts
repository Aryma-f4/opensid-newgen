import { isVisibleMenu } from "./adminMenuVisibility"

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

export type RawAdminMenuRow = {
  id: number
  modul: string
  slug: string | null
  url: string
  ikon: string | null
  urut: number | null
  parent: number | null
  hidden: number
}

export function buildAdminMenu(rows: RawAdminMenuRow[]): Modul[] {
  const byParent = new Map<number, Modul[]>()

  for (const row of rows) {
    if (!isVisibleMenu(Number(row.hidden))) continue

    const parent = row.parent ?? 0
    if (!byParent.has(parent)) byParent.set(parent, [])
    byParent.get(parent)!.push({
      id: row.id,
      modul: row.modul,
      slug: row.slug,
      url: row.url,
      ikon: row.ikon,
      urut: row.urut,
      parent,
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
