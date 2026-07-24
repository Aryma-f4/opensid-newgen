"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function createUser(data: any) {
  await checkAuth()
  const payload: any = {
    config_id: 1,
    username: data.username,
    nama: data.nama,
    email: data.email || null,
    id_grup: data.id_grup ? parseInt(data.id_grup) : null,
    active: data.active === true || data.active === "1" ? 1 : 0,
    password: bcrypt.hashSync(data.password || "opensesame", 10),
  }
  await prisma.user.create({ data: payload })
  revalidatePath("/man_user")
  return { success: true }
}

export async function updateUser(id: number, data: any) {
  await checkAuth()
  const payload: any = {
    username: data.username,
    nama: data.nama,
    email: data.email || null,
    id_grup: data.id_grup ? parseInt(data.id_grup) : null,
    active: data.active === true || data.active === "1" ? 1 : 0,
  }
  if (data.password) {
    payload.password = bcrypt.hashSync(data.password, 10)
  }
  await prisma.user.update({ where: { id }, data: payload })
  revalidatePath("/man_user")
  return { success: true }
}

export async function deleteUser(ids: number[]) {
  await checkAuth()
  await prisma.user.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/man_user")
  return { success: true }
}
