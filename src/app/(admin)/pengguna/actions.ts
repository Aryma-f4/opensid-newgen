"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProfil(data: {
  nama: string
  email: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.user.update({
    where: { id: parseInt(session.user.id) },
    data: {
      nama: data.nama,
      email: data.email,
    },
  })

  revalidatePath("/pengguna")
  return { success: true }
}
