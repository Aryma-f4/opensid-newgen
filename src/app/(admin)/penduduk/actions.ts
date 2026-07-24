"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
}

export async function createPenduduk(data: any) {
  await checkAuth()
  if (!data.nik || data.nik.length !== 16) throw new Error("NIK harus 16 digit")
  if (!data.nama?.trim()) throw new Error("Nama wajib diisi")

  const createData: any = {
    nik: data.nik,
    nama: data.nama,
    sex: parseInt(data.sex) || 0,
    tempatlahir: data.tempatlahir || null,
    agama_id: parseInt(data.agama_id) || null,
    pendidikan_kk_id: parseInt(data.pendidikan_kk_id) || null,
    pekerjaan_id: parseInt(data.pekerjaan_id) || null,
    status_kawin: parseInt(data.status_kawin) || null,
    warganegara_id: parseInt(data.warganegara_id) || null,
    id_cluster: parseInt(data.id_cluster) || null,
    alamat_sekarang: data.alamat_sekarang || null,
    telepon: data.telepon || null,
    status_dasar: 1,
    created_at: new Date(),
    config_id: 1,
  }
  if (data.tanggallahir) createData.tanggallahir = new Date(data.tanggallahir)
  await prisma.tweb_penduduk.create({ data: createData })

  revalidatePath("/penduduk")
  return { success: true }
}

export async function updatePenduduk(id: number, data: any) {
  await checkAuth()
  if (data.nik && data.nik.length !== 16) throw new Error("NIK harus 16 digit")

  const updateData: any = {
    nik: data.nik,
    nama: data.nama,
    sex: parseInt(data.sex) ?? undefined,
    tempatlahir: data.tempatlahir ?? null,
    agama_id: parseInt(data.agama_id) || null,
    pendidikan_kk_id: parseInt(data.pendidikan_kk_id) || null,
    pekerjaan_id: parseInt(data.pekerjaan_id) || null,
    status_kawin: parseInt(data.status_kawin) || null,
    warganegara_id: parseInt(data.warganegara_id) || null,
    id_cluster: parseInt(data.id_cluster) || null,
    alamat_sekarang: data.alamat_sekarang || null,
    telepon: data.telepon || null,
    updated_at: new Date(),
  }
  if (data.tanggallahir) updateData.tanggallahir = new Date(data.tanggallahir)
  await prisma.tweb_penduduk.update({ where: { id }, data: updateData })

  revalidatePath("/penduduk")
  revalidatePath(`/penduduk/${id}`)
  return { success: true }
}

export async function deletePenduduk(ids: number[]) {
  await checkAuth()
  // Soft-delete: set status_dasar = 2 (mati)
  await prisma.tweb_penduduk.updateMany({
    where: { id: { in: ids } },
    data: { status_dasar: 2, updated_at: new Date() },
  })
  revalidatePath("/penduduk")
  return { success: true }
}

export async function importPenduduk(formData: FormData) {
  await checkAuth()
  const file = formData.get("file") as File
  if (!file) throw new Error("File diperlukan")

  const text = await file.text()
  const lines = text.split("\n").filter(Boolean)
  let imported = 0
  let errors = 0
  const messages: string[] = []

  // Assume header row (skip line 0)
  for (let i = 1; i < lines.length; i++) {
    try {
      // Handle CSV with possible quoted fields
      const cols: string[] = []
      let current = ""
      let inQuotes = false
      for (const ch of lines[i]) {
        if (ch === '"') { inQuotes = !inQuotes; continue }
        if (ch === "," && !inQuotes) { cols.push(current.trim()); current = ""; continue }
        current += ch
      }
      cols.push(current.trim())

      if (cols.length < 2) continue

      const nik = cols[0]
      const nama = cols[1]

      // Validate NIK
      if (!nik || nik.length !== 16) {
        errors++
        messages.push(`Baris ${i + 1}: NIK tidak valid (${nik || "kosong"})`)
        continue
      }
      if (!nama) {
        errors++
        messages.push(`Baris ${i + 1}: Nama kosong`)
        continue
      }

      const c = (i: number) => cols[i] ?? ""
      const importData: Record<string, any> = {
        nik,
        nama,
        sex: parseInt(c(2)) || 0,
        status_dasar: 1,
        config_id: 1,
        created_at: new Date(),
      }
      if (c(3)) importData.tempatlahir = c(3)
      if (c(4)) importData.tanggallahir = new Date(c(4))
      if (c(5)) importData.agama_id = parseInt(c(5))
      if (c(6)) importData.pendidikan_kk_id = parseInt(c(6))
      if (c(7)) importData.pekerjaan_id = parseInt(c(7))
      if (c(8)) importData.status_kawin = parseInt(c(8))
      if (c(9)) importData.warganegara_id = parseInt(c(9))
      if (c(10)) importData.alamat_sekarang = c(10)
      if (c(11)) importData.telepon = c(11)
      await prisma.tweb_penduduk.create({ data: importData as any })
      imported++
    } catch (e: any) {
      errors++
      messages.push(`Baris ${i + 1}: ${e.message}`)
    }
  }

  revalidatePath("/penduduk")
  return { success: true, imported, errors, messages }
}
