"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function deleteArtikel(ids: number[]) {
  await checkAuth()
  await prisma.artikel.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/web")
  return { success: true }
}

export async function toggleStatus(id: number, field: string, value: boolean) {
  await checkAuth()
  await prisma.artikel.update({ where: { id }, data: { [field]: value ? 1 : 0 } })
  revalidatePath("/web")
  return { success: true }
}
