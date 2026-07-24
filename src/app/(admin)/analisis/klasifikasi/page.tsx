import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function KlasifikasiPage() {
  const [data, masterList] = await Promise.all([
    prisma.analisis_klasifikasi.findMany({
      orderBy: { id: "desc" as any },
      take: 100,
      include: {
        analisis_master: { select: { nama: true } },
      },
    }),
    prisma.analisis_master.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ])

  return <Manager initial={data as any} masterList={masterList} />
}
