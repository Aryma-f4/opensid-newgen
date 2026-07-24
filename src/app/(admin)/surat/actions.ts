"use server"
import { prisma } from "@/lib/prisma"; import { auth } from "@/lib/auth"; import { revalidatePath } from "next/cache"
async function ck() { if (!(await auth())?.user?.id) throw new Error("Unauthorized") }
export async function createItem(d: any) { await ck(); await prisma.tweb_surat_format.create({ data: { ...d, config_id: 1 } }); revalidatePath("/surat"); return { success: true } }
export async function updateItem(i: number, d: any) { await ck(); await prisma.tweb_surat_format.update({ where: { id: i }, data: d }); revalidatePath("/surat"); return { success: true } }
export async function deleteItem(i: number[]) { await ck(); await prisma.tweb_surat_format.deleteMany({ where: { id: { in: i } } }); revalidatePath("/surat"); return { success: true } }
