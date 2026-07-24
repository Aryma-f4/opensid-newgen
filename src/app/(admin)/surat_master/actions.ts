"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function createSurat(data: any) {
  await checkAuth()
  const payload: any = {
    config_id: 1,
    nama: data.nama,
    url_surat: data.url_surat,
    kode_surat: data.kode_surat || null,
    jenis: parseInt(data.jenis) || 2,
    mandiri: data.mandiri === true || data.mandiri === "1",
    favorit: data.favorit === true || data.favorit === "1",
    kunci: data.kunci === true || data.kunci === "1",
    qr_code: data.qr_code === true || data.qr_code === "1",
    lampiran: data.lampiran || null,
    template: data.template || null,
    created_at: new Date(),
  }
  await prisma.tweb_surat_format.create({ data: payload })
  revalidatePath("/surat_master")
  return { success: true }
}

export async function updateSurat(id: number, data: any) {
  await checkAuth()
  const payload: any = {
    nama: data.nama,
    url_surat: data.url_surat,
    kode_surat: data.kode_surat || null,
    jenis: parseInt(data.jenis) || 2,
    mandiri: data.mandiri === true || data.mandiri === "1",
    favorit: data.favorit === true || data.favorit === "1",
    kunci: data.kunci === true || data.kunci === "1",
    qr_code: data.qr_code === true || data.qr_code === "1",
    lampiran: data.lampiran || null,
    template: data.template || null,
    updated_at: new Date(),
  }
  await prisma.tweb_surat_format.update({ where: { id }, data: payload })
  revalidatePath("/surat_master")
  return { success: true }
}

export async function deleteSurat(ids: number[]) {
  await checkAuth()
  await prisma.tweb_surat_format.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/surat_master")
  return { success: true }
}
