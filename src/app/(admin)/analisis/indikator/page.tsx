import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function IndikatorPage() {
  const [data, tipeIndikator, kategoriList, masterList] = await Promise.all([
    prisma.analisis_indikator.findMany({
      orderBy: { id: "desc" as any },
      take: 100,
      include: {
        analisis_kategori_indikator: { select: { kategori: true } },
        analisis_master: { select: { nama: true } },
        analisis_tipe_indikator: { select: { tipe: true } },
        _count: { select: { analisis_parameter: true } },
      },
    }),
    prisma.analisis_tipe_indikator.findMany({ orderBy: { id: "asc" } }),
    prisma.analisis_kategori_indikator.findMany({ orderBy: { kategori: "asc" }, select: { id: true, kategori: true, id_master: true } }),
    prisma.analisis_master.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ])

  return <Manager initial={data as any} tipeIndikator={tipeIndikator} kategoriList={kategoriList} masterList={masterList} />
}
