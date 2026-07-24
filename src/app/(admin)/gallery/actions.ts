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

export async function createAlbum(data: any) {
  await checkAuth()
  let gambar = data.gambar || null

  // If a file was uploaded (passed as File object in FormData), save it
  if (data._file && data._file instanceof File && data._file.size > 0) {
    gambar = await uploadFile(data._file, "gallery")
  }

  const payload: any = {
    config_id: 1,
    parrent: 0,
    nama: data.nama,
    gambar: gambar,
    enabled: data.enabled === true || data.enabled === "1" || data.enabled === 1 ? 1 : 0,
    urut: data.urut ? parseInt(data.urut) : null,
    tgl_upload: new Date(),
  }
  await prisma.gambar_gallery.create({ data: payload })
  revalidatePath("/gallery")
  return { success: true }
}

export async function updateAlbum(id: number, data: any) {
  await checkAuth()
  let gambar = data.gambar || null

  // If a file was uploaded
  if (data._file && data._file instanceof File && data._file.size > 0) {
    gambar = await uploadFile(data._file, "gallery")
  }

  const payload: any = {
    nama: data.nama,
    gambar: gambar,
    enabled: data.enabled === true || data.enabled === "1" || data.enabled === 1 ? 1 : 0,
    urut: data.urut ? parseInt(data.urut) : null,
  }
  await prisma.gambar_gallery.update({ where: { id }, data: payload })
  revalidatePath("/gallery")
  return { success: true }
}

export async function deleteAlbum(ids: number[]) {
  await checkAuth()
  // Delete album + all photos inside it
  for (const id of ids) {
    await prisma.gambar_gallery.deleteMany({ where: { parrent: id } })
  }
  await prisma.gambar_gallery.deleteMany({ where: { id: { in: ids } } })
  revalidatePath("/gallery")
  return { success: true }
}

// Upload photo into an album
export async function uploadPhoto(formData: FormData) {
  await checkAuth()
  const albumId = parseInt(formData.get("albumId") as string)
  const file = formData.get("file") as File
  if (!file || !albumId) throw new Error("File and albumId required")

  const filename = await uploadFile(file, "gallery")
  await prisma.gambar_gallery.create({
    data: {
      config_id: 1,
      parrent: albumId,
      nama: file.name.replace(/\.[^/.]+$/, ""),
      gambar: filename,
      enabled: 1,
      tgl_upload: new Date(),
    },
  })
  revalidatePath("/gallery")
  return { success: true, filename }
}
