"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function addKategori(data: { kategori: string; slug?: string; urut?: number; parrent?: number; enabled?: number }) {
  await checkAuth()
  
  const slug = data.slug || String(data.kategori || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  
  await prisma.kategori.create({
    data: {
      kategori: data.kategori,
      slug,
      urut: data.urut ?? 0,
      enabled: data.enabled ?? 1,
      parrent: data.parrent ?? 0,
      config_id: 1, // Default config_id, normally from session or config
      tipe: 1,
    }
  })
  
  revalidatePath("/kategori")
  return { success: true }
}

export async function updateKategori(id: number, data: { kategori: string; slug?: string; urut?: number; parrent?: number; enabled?: number }) {
  await checkAuth()

  const slug = data.slug || String(data.kategori || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  await prisma.kategori.update({
    where: { id },
    data: {
      kategori: data.kategori,
      slug,
      urut: data.urut ?? 0,
      enabled: data.enabled,
      parrent: data.parrent,
    }
  })

  revalidatePath("/kategori")
  return { success: true }
}

export async function deleteKategoris(ids: number[]) {
  await checkAuth()
  
  // Can't delete if it has artikel or children
  for (const id of ids) {
    const k = await prisma.kategori.findUnique({
      where: { id },
      include: {
        _count: { select: { artikel: true } }
      }
    })
    
    if (k && k._count.artikel > 0) {
      throw new Error(`Kategori ${k.kategori} tidak dapat dihapus karena masih memiliki artikel.`)
    }
    
    const childrenCount = await prisma.kategori.count({ where: { parrent: id } })
    if (childrenCount > 0) {
      throw new Error(`Kategori ${k?.kategori} tidak dapat dihapus karena masih memiliki subkategori.`)
    }
  }

  await prisma.kategori.deleteMany({
    where: { id: { in: ids } }
  })
  
  revalidatePath("/kategori")
  return { success: true }
}

export async function toggleKategori(id: number, currentEnabled: number) {
  await checkAuth()
  await prisma.kategori.update({
    where: { id },
    data: { enabled: currentEnabled === 1 ? 0 : 1 }
  })
  revalidatePath("/kategori")
  return { success: true }
}
