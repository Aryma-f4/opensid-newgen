"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateSetting(id: number, value: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.setting_aplikasi.update({
    where: { id },
    data: { value },
  })

  revalidatePath("/setting")
  return { success: true }
}
