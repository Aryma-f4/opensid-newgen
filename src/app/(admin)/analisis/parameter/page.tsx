import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function ParameterPage() {
  const [data, indikatorList] = await Promise.all([
    prisma.analisis_parameter.findMany({
      orderBy: { id: "desc" as any },
      take: 100,
      include: {
        analisis_indikator: { select: { pertanyaan: true, nomor: true } },
      },
    }),
    prisma.analisis_indikator.findMany({ orderBy: { nomor: "asc" }, select: { id: true, pertanyaan: true, nomor: true } }),
  ])

  return <Manager initial={data as any} indikatorList={indikatorList} />
}
