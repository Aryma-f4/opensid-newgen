"use server"
import { prisma } from "@/lib/prisma"; import { auth } from "@/lib/auth"; import { revalidatePath } from "next/cache"
async function ck() { if (!(await auth())?.user?.id) throw new Error("Unauthorized") }
export async function createItem(d: any) { await ck(); await prisma.surat_dinas.create({ data: { ...d, config_id: 1 } }); revalidatePath("/surat_dinas"); return { success: true } }
export async function updateItem(i: number, d: any) { await ck(); await prisma.surat_dinas.update({ where: { id: i }, data: d }); revalidatePath("/surat_dinas"); return { success: true } }
export async function deleteItem(i: number[]) { await ck(); await prisma.surat_dinas.deleteMany({ where: { id: { in: i } } }); revalidatePath("/surat_dinas"); return { success: true } }
