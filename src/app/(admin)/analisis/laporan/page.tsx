import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function LaporanPage() {
  const [masterList, periodeList] = await Promise.all([
    prisma.analisis_master.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.analisis_periode.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ])

  return <Manager masterList={masterList} periodeList={periodeList} />
}
