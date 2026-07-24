"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import {
  BukuTamuConfigInputError,
  parseConfigRecordId,
  parseNeedInput,
  tenantOwnedWhere,
} from "@/lib/bukuTamuConfig"
import { prisma } from "@/lib/prisma"

const moduleUrl = "buku_keperluan"
const pagePath = "/buku_keperluan"

export type NeedActionResult =
  | { success: true }
  | { success: false; error: string }

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof BukuTamuConfigInputError) return error.message
  if (error instanceof Error && error.message === "Tidak memiliki akses.") return error.message
  return fallback
}

export async function createNeed(formData: FormData): Promise<NeedActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const input = parseNeedInput(formData)

    await prisma.buku_keperluan.create({
      data: {
        config_id: actor.configId,
        keperluan: input.keperluan,
        status: input.status,
      },
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Keperluan gagal disimpan.") }
  }
}

export async function updateNeed(formData: FormData): Promise<NeedActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseConfigRecordId(formData)
    const input = parseNeedInput(formData)
    const updated = await prisma.buku_keperluan.updateMany({
      where: tenantOwnedWhere(id, actor.configId),
      data: {
        keperluan: input.keperluan,
        status: input.status,
      },
    })

    if (updated.count !== 1) {
      return { success: false, error: "Keperluan tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Keperluan gagal diubah.") }
  }
}

export async function deleteNeed(formData: FormData): Promise<NeedActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "h")
    const id = parseConfigRecordId(formData)
    const deleted = await prisma.buku_keperluan.deleteMany({
      where: tenantOwnedWhere(id, actor.configId),
    })

    if (deleted.count !== 1) {
      return { success: false, error: "Keperluan tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Keperluan gagal dihapus.") }
  }
}
