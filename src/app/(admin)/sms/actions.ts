"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function sendSms(data: { tujuan: string; pesan: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (!data.tujuan || !data.pesan) throw new Error("Tujuan dan pesan wajib diisi")
  await prisma.outbox.create({
    data: { DestinationNumber: data.tujuan, TextDecoded: data.pesan, SendingDateTime: new Date(), Status: 0, CreatorID: "opensid" } as any,
  })
  revalidatePath("/sms")
  return { success: true }
}
