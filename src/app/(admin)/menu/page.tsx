import { prisma } from "@/lib/prisma"
import MenuManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function MenuPage() {
  const items = await prisma.menu.findMany({ orderBy: [{ urut: "asc" }] })

  type MenuWithDepth = (typeof items)[number] & { depth: number }
  function buildTree(parent = 0, depth = 0): MenuWithDepth[] {
    const result: MenuWithDepth[] = []
    for (const item of items) {
      if ((item.parrent ?? 0) === parent) {
        result.push({ ...item, depth })
        result.push(...buildTree(item.id, depth + 1))
      }
    }
    return result
  }

  return <MenuManager initial={buildTree()} />
}