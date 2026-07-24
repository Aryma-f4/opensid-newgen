import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function StatistikPage() {
  const masterList = await prisma.analisis_master.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } })

  return <Manager masterList={masterList} />
}
