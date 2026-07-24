"use server"
import { prisma } from "@/lib/prisma"; import { auth } from "@/lib/auth"; import { revalidatePath } from "next/cache"
async function ck() { if (!(await auth())?.user?.id) throw new Error("Unauthorized") }
export async function createItem(d: any) { await ck(); await prisma.sasaran_paud.create({ data: { ...d, config_id: 1 } }); revalidatePath("/stunting"); return { success: true } }
export async function updateItem(i: number, d: any) { await ck(); await prisma.sasaran_paud.update({ where: { id_sasaran_paud: i }, data: d }); revalidatePath("/stunting"); return { success: true } }
export async function deleteItem(i: number[]) { await ck(); await prisma.sasaran_paud.deleteMany({ where: { id_sasaran_paud: { in: i } } }); revalidatePath("/stunting"); return { success: true } }
