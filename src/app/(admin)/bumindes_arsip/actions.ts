"use server"
import { prisma } from "@/lib/prisma"; import { auth } from "@/lib/auth"; import { revalidatePath } from "next/cache"
async function ck() { if (!(await auth())?.user?.id) throw new Error("Unauthorized") }
export async function createItem(d: any) { await ck(); await prisma.log_surat.create({ data: { ...d, config_id: 1 } }); revalidatePath("/bumindes_arsip"); return { success: true } }
export async function updateItem(i: number, d: any) { await ck(); await prisma.log_surat.update({ where: { id: i }, data: d }); revalidatePath("/bumindes_arsip"); return { success: true } }
export async function deleteItem(i: number[]) { await ck(); await prisma.log_surat.deleteMany({ where: { id: { in: i } } }); revalidatePath("/bumindes_arsip"); return { success: true } }
