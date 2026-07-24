import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function KategoriIndikatorPage() {
  const data = await prisma.analisis_kategori_indikator.findMany({
    orderBy: { id: "desc" as any },
    take: 100,
    include: {
      analisis_master: { select: { nama: true } },
      _count: { select: { analisis_indikator: true } },
    },
  })

  return <Manager initial={data as any} />
}
