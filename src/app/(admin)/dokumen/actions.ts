"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const ext = path.extname(file.name) || ""
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const relativePath = path.join(subdir, safeName)
  const storagePath = path.join(process.cwd(), "public", "storage", relativePath)
  await mkdir(path.dirname(storagePath), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(storagePath, buffer)
  return relativePath
}

export async function createDokumen(data: any) {
  await checkAuth()

  let lokasiArsip = data.lokasi_arsip || ""

  // Handle file upload
  if (data.file && typeof data.file === "object" && data.file.name) {
    lokasiArsip = await saveUploadedFile(data.file, "dokumen")
  }

  const payload: any = {
    config_id: 1,
    nama: data.nama,
    tahun: data.tahun ? parseInt(data.tahun) : null,
    enabled: data.enabled === true || data.enabled === "1" || data.enabled === 1 ? 1 : 0,
    kategori: data.kategori ? parseInt(data.kategori) : 1,
    tipe: data.tipe ? parseInt(data.tipe) : 1,
    lokasi_arsip: lokasiArsip,
    keterangan: data.keterangan || null,
    tgl_upload: new Date(),
    deleted: false,
  }
  await prisma.dokumen.create({ data: payload })
  revalidatePath("/dokumen")
  return { success: true }
}

export async function updateDokumen(id: number, data: any) {
  await checkAuth()

  let lokasiArsip = data.lokasi_arsip || ""

  // Handle file upload on update
  if (data.file && typeof data.file === "object" && data.file.name) {
    lokasiArsip = await saveUploadedFile(data.file, "dokumen")
  }

  const payload: any = {
    nama: data.nama,
    tahun: data.tahun ? parseInt(data.tahun) : null,
    enabled: data.enabled === true || data.enabled === "1" || data.enabled === 1 ? 1 : 0,
    kategori: data.kategori ? parseInt(data.kategori) : 1,
    tipe: data.tipe ? parseInt(data.tipe) : 1,
    lokasi_arsip: lokasiArsip,
    keterangan: data.keterangan || null,
    updated_at: new Date(),
  }
  await prisma.dokumen.update({ where: { id }, data: payload })
  revalidatePath("/dokumen")
  return { success: true }
}

export async function deleteDokumen(ids: number[]) {
  await checkAuth()
  await prisma.dokumen.updateMany({
    where: { id: { in: ids } },
    data: { deleted: true, updated_at: new Date() },
  })
  revalidatePath("/dokumen")
  return { success: true }
}
