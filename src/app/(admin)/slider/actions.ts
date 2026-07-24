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

async function uploadFile(file: File, subdir: string): Promise<string> {
  const ext = path.extname(file.name) || ""
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const storagePath = path.join(process.cwd(), "public", "storage", subdir, safeName)
  await mkdir(path.dirname(storagePath), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(storagePath, buffer)
  return safeName
}

export async function create(data: any) {
  await checkAuth()
  let gambar = data.gambar || null

  if (data._file && data._file instanceof File && data._file.size > 0) {
    gambar = await uploadFile(data._file, "slider")
  }

  const payload: any = {
    config_id: 1,
    judul: data.judul,
    isi: data.isi || null,
    gambar: gambar,
    enabled: data.enabled === true || data.enabled === "1" || data.enabled === 1 ? 1 : 0,
    slider: true,
    tipe: "dinamis",
    tgl_upload: new Date(),
  }
  await prisma.artikel.create({ data: payload })
  revalidatePath("/slider")
  return { success: true }
}

export async function update(id: number, data: any) {
  await checkAuth()
  let gambar = data.gambar || null

  if (data._file && data._file instanceof File && data._file.size > 0) {
    gambar = await uploadFile(data._file, "slider")
  }

  const payload: any = {
    judul: data.judul,
    isi: data.isi || null,
    gambar: gambar,
    enabled: data.enabled === true || data.enabled === "1" || data.enabled === 1 ? 1 : 0,
  }
  await prisma.artikel.update({ where: { id }, data: payload })
  revalidatePath("/slider")
  revalidatePath(`/slider/${id}`)
  return { success: true }
}

export async function deleteSliders(ids: number[]) {
  await checkAuth()
  await prisma.artikel.deleteMany({ where: { id: { in: ids }, slider: true } })
  revalidatePath("/slider")
  return { success: true }
}
