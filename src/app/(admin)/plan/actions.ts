"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import {
  AdminDomainInputError,
  canDeleteLocation,
  parseAdminRecordId,
  parseBinaryStatusChange,
  parseLocationInput,
  tenantLocationWhere,
  tenantPointWhere,
} from "@/lib/adminDomainScope"
import { prisma } from "@/lib/prisma"

const moduleUrl = "plan"
const pagePath = "/plan"

export type PlanActionResult =
  | { success: true }
  | { success: false; error: string }

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AdminDomainInputError) return error.message
  if (error instanceof Error && error.message === "Tidak memiliki akses.") return error.message
  return fallback
}

async function ensureTenantPoint(refPoint: number, configId: number) {
  const point = await prisma.point.findFirst({
    where: {
      ...tenantPointWhere(refPoint, configId),
      tipe: 2,
    },
    select: { id: true },
  })
  if (!point) {
    throw new AdminDomainInputError("Kategori lokasi tidak tersedia pada tenant ini.")
  }
}

export async function createLocation(formData: FormData): Promise<PlanActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const input = parseLocationInput(formData)
    await ensureTenantPoint(input.ref_point, actor.configId)

    await prisma.lokasi.create({
      data: {
        config_id: actor.configId,
        ...input,
      },
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Lokasi gagal disimpan.") }
  }
}

export async function updateLocation(formData: FormData): Promise<PlanActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseAdminRecordId(formData)
    const input = parseLocationInput(formData)
    await ensureTenantPoint(input.ref_point, actor.configId)

    const updated = await prisma.lokasi.updateMany({
      where: tenantLocationWhere(id, actor.configId),
      data: input,
    })
    if (updated.count !== 1) {
      return { success: false, error: "Lokasi tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Lokasi gagal diubah.") }
  }
}

export async function changeLocationStatus(
  formData: FormData,
): Promise<PlanActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseAdminRecordId(formData)
    const status = parseBinaryStatusChange(formData)
    const updated = await prisma.lokasi.updateMany({
      where: tenantLocationWhere(id, actor.configId),
      data: { enabled: status },
    })
    if (updated.count !== 1) {
      return { success: false, error: "Lokasi tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Status lokasi gagal diubah.") }
  }
}

export async function deleteLocation(formData: FormData): Promise<PlanActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "h")
    const id = parseAdminRecordId(formData)
    const result = await prisma.$transaction(async (transaction) => {
      const locked = await transaction.$queryRaw<Array<{ id: number }>>`
        SELECT id
        FROM lokasi
        WHERE id = ${id}
          AND config_id = ${actor.configId}
        FOR UPDATE
      `
      if (locked.length !== 1) {
        return { success: false as const, error: "Lokasi tidak ditemukan pada tenant ini." }
      }

      const record = await transaction.lokasi.findFirst({
        where: tenantLocationWhere(id, actor.configId),
        select: { id: true, foto: true },
      })
      if (!record) {
        return { success: false as const, error: "Lokasi tidak ditemukan pada tenant ini." }
      }
      if (!canDeleteLocation(Boolean(record.foto))) {
        return {
          success: false as const,
          error: "Lokasi memiliki foto yang masih dikelola layanan berkas lama. Nonaktifkan lokasi sampai pemindahan berkas tersedia.",
        }
      }

      const deleted = await transaction.lokasi.deleteMany({
        where: tenantLocationWhere(id, actor.configId),
      })
      if (deleted.count !== 1) {
        return { success: false as const, error: "Lokasi tidak ditemukan pada tenant ini." }
      }
      return { success: true as const }
    })
    if (!result.success) return result

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Lokasi gagal dihapus.") }
  }
}
