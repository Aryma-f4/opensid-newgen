import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function AnalisisMasterPage() {
  const data = await prisma.analisis_master.findMany({
    orderBy: { id: "desc" as any },
    take: 100,
    include: {
      analisis_ref_subjek: { select: { subjek: true } },
      _count: { select: { analisis_indikator: true, analisis_periode: true } },
    },
  })

  return <Manager initial={data as any} />
}
