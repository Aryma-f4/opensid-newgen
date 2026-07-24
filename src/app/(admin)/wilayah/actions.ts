"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function createWilayah(data: any) {
  await checkAuth()
  const payload: any = {
    config_id: 1,
    dusun: data.dusun || "-",
    rw: data.rw || "0",
    rt: data.rt || "0",
    id_kepala: data.id_kepala ? parseInt(data.id_kepala) : null,
  }
  await prisma.tweb_wil_clusterdesa.create({ data: payload })
  revalidatePath("/wilayah")
  return { success: true }
}

export async function updateWilayah(id: number, data: any) {
  await checkAuth()
  const payload: any = {
    dusun: data.dusun || "-",
    rw: data.rw || "0",
    rt: data.rt || "0",
    id_kepala: data.id_kepala ? parseInt(data.id_kepala) : null,
  }
  await prisma.tweb_wil_clusterdesa.update({ where: { id }, data: payload })
  revalidatePath("/wilayah")
  return { success: true }
}

export async function deleteWilayah(ids: number[]) {
  await checkAuth()
  await prisma.tweb_wil_clusterdesa.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/wilayah")
  return { success: true }
}
