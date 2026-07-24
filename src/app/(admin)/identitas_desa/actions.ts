"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateIdentitasDesa(data: {
  nama_desa: string
  alamat_kantor: string
  nama_kecamatan: string
  nama_kabupaten: string
  email_desa: string
  telepon: string
  kode_pos: number | null
  website: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.config.updateMany({
    where: { app_key: { not: "" } },
    data: {
      nama_desa: data.nama_desa,
      alamat_kantor: data.alamat_kantor,
      nama_kecamatan: data.nama_kecamatan,
      nama_kabupaten: data.nama_kabupaten,
      email_desa: data.email_desa,
      telepon: data.telepon,
      kode_pos: data.kode_pos,
      website: data.website,
    },
  })

  revalidatePath("/identitas_desa")
  return { success: true }
}
