"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function createRtm(data: any) {
  await checkAuth()
  const payload: any = {
    config_id: 1,
    no_kk: data.no_kk,
    nik_kepala: data.nik_kepala ? parseInt(data.nik_kepala) : null,
    kelas_sosial: data.kelas_sosial ? parseInt(data.kelas_sosial) : null,
    terdaftar_dtks: data.terdaftar_dtks === true || data.terdaftar_dtks === "1",
    tgl_daftar: data.tgl_daftar ? new Date(data.tgl_daftar) : new Date(),
  }
  await prisma.tweb_rtm.create({ data: payload })
  revalidatePath("/rtm")
  return { success: true }
}

export async function updateRtm(id: number, data: any) {
  await checkAuth()
  const payload: any = {
    no_kk: data.no_kk,
    nik_kepala: data.nik_kepala ? parseInt(data.nik_kepala) : null,
    kelas_sosial: data.kelas_sosial ? parseInt(data.kelas_sosial) : null,
    terdaftar_dtks: data.terdaftar_dtks === true || data.terdaftar_dtks === "1",
  }
  await prisma.tweb_rtm.update({ where: { id }, data: payload })
  revalidatePath("/rtm")
  return { success: true }
}

export async function deleteRtm(ids: number[]) {
  await checkAuth()
  await prisma.tweb_rtm.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/rtm")
  return { success: true }
}
