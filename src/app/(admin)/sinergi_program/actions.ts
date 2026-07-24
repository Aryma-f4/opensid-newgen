"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function ck() {
  if (!(await auth())?.user?.id) throw new Error("Unauthorized")
}

export async function createItem(d: any) {
  await ck()
  await prisma.sinergi_program.create({ data: { ...d, config_id: 1 } })
  revalidatePath("/sinergi_program")
  return { success: true }
}

export async function updateItem(uuid: string, d: any) {
  await ck()
  await prisma.sinergi_program.update({ where: { uuid }, data: d })
  revalidatePath("/sinergi_program")
  return { success: true }
}

export async function deleteItem(uuids: string[]) {
  await ck()
  await prisma.sinergi_program.deleteMany({ where: { uuid: { in: uuids } } })
  revalidatePath("/sinergi_program")
  return { success: true }
}
