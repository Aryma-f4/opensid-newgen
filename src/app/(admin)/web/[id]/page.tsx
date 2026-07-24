import { prisma } from "@/lib/prisma"
import EditForm from "./EditForm"

export const dynamic = "force-dynamic"

export default async function EditArtikelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [artikel, kategori] = await Promise.all([
    prisma.artikel.findUnique({ where: { id: parseInt(id) } }),
    prisma.kategori.findMany({ orderBy: { urut: "asc" }, select: { id: true, kategori: true } }),
  ])

  if (!artikel) return <div className="text-gray-500 p-4">Artikel tidak ditemukan.</div>

  return <EditForm artikel={artikel} kategori={kategori} />
}