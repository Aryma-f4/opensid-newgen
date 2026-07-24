import { prisma } from "@/lib/prisma"
import Manager from "./Manager"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function KategoriPage({ searchParams }: { searchParams: Promise<{ parent?: string }> }) {
  const params = await searchParams;
  const parentId = parseInt(params.parent || "0") || 0

  const kategori = await prisma.kategori.findMany({
    where: { parrent: parentId },
    orderBy: { urut: "asc" },
    include: {
      _count: { select: { artikel: true } },
      artikel: { select: { id: true }, take: 1 } // Just to know if it has any, though _count is better
    },
  })
  
  let parentName = ""
  if (parentId > 0) {
    const parentKategori = await prisma.kategori.findUnique({
      where: { id: parentId },
      select: { kategori: true }
    })
    if (parentKategori) {
      parentName = parentKategori.kategori
    }
  }

  // Also prefetch the subcategories count for each so we know if they can be deleted
  const kategoriWithSubcount = await Promise.all(
    kategori.map(async (k) => {
      const subCount = await prisma.kategori.count({ where: { parrent: k.id } })
      return { ...k, subCount }
    })
  )

  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <Manager initial={kategoriWithSubcount} parentId={parentId} parentName={parentName} />
    </Suspense>
  )
}