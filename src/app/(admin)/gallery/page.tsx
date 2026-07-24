import { prisma } from "@/lib/prisma"
import GalleryManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function GalleryPage() {
  const [albums, fotoCount] = await Promise.all([
    prisma.gambar_gallery.findMany({
      where: { parrent: 0 },
      orderBy: [{ urut: "asc" }, { id: "asc" }],
    }),
    prisma.gambar_gallery.groupBy({
      by: ["parrent"],
      where: { parrent: { not: 0 } },
      _count: { _all: true },
    }),
  ])

  const countMap = new Map(fotoCount.map((f) => [f.parrent, f._count._all]))
  const data = albums.map((a) => ({
    id: a.id,
    nama: a.nama,
    gambar: a.gambar,
    enabled: a.enabled,
    urut: a.urut,
    fotoCount: countMap.get(a.id) ?? 0,
  }))

  return <GalleryManager data={data} />
}
