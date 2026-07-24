"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function createKelompok(data: any) {
  await checkAuth()
  const payload: any = {
    config_id: 1,
    nama: data.nama,
    kode: data.kode,
    id_master: parseInt(data.id_master) || 1,
    id_ketua: data.id_ketua ? parseInt(data.id_ketua) : null,
    tipe: "kelompok",
    keterangan: data.keterangan || null,
    no_sk_pendirian: data.no_sk_pendirian || null,
  }
  await prisma.kelompok.create({ data: payload })
  revalidatePath("/kelompok")
  return { success: true }
}

export async function updateKelompok(id: number, data: any) {
  await checkAuth()
  const payload: any = {
    nama: data.nama,
    kode: data.kode,
    id_master: parseInt(data.id_master) || 1,
    id_ketua: data.id_ketua ? parseInt(data.id_ketua) : null,
    keterangan: data.keterangan || null,
    no_sk_pendirian: data.no_sk_pendirian || null,
  }
  await prisma.kelompok.update({ where: { id }, data: payload })
  revalidatePath("/kelompok")
  return { success: true }
}

export async function deleteKelompok(ids: number[]) {
  await checkAuth()
  await prisma.kelompok.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/kelompok")
  return { success: true }
}
