"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function ck() {
  if (!(await auth())?.user?.id) throw new Error("Unauthorized")
}

export async function createItem(d: any) {
  await ck()
  await prisma.kontak.create({ data: { ...d, config_id: 1 } })
  revalidatePath("/kontak")
  return { success: true }
}

export async function updateItem(i: number, d: any) {
  await ck()
  await prisma.kontak.update({ where: { id_kontak: i }, data: d })
  revalidatePath("/kontak")
  return { success: true }
}

export async function deleteItem(i: number[]) {
  await ck()
  await prisma.kontak.deleteMany({ where: { id_kontak: { in: i } } })
  revalidatePath("/kontak")
  return { success: true }
}
