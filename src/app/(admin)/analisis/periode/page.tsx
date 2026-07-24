import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function PeriodePage() {
  const [data, masterList, stateList] = await Promise.all([
    prisma.analisis_periode.findMany({
      orderBy: { id: "desc" as any },
      take: 100,
      include: {
        analisis_master: { select: { nama: true } },
        analisis_ref_state: { select: { nama: true } },
      },
    }),
    prisma.analisis_master.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.analisis_ref_state.findMany({ orderBy: { id: "asc" } }),
  ])

  return <Manager initial={data as any} masterList={masterList} stateList={stateList} />
}
