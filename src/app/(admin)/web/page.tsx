import { prisma } from "@/lib/prisma"
import WebClient from "./webClient"

export const dynamic = "force-dynamic"

export default async function ArtikelList({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const perPage = 20
  const [artikel, total] = await Promise.all([
    prisma.artikel.findMany({
      include: { kategori: true },
      orderBy: { tgl_upload: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.artikel.count(),
  ])

  return (
    <WebClient
      artikel={artikel}
      total={total}
      page={page}
      pages={Math.ceil(total / perPage)}
    />
  )
}
