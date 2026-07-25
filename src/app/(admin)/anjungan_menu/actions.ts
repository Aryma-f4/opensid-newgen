"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import {
  AnjunganInputError,
  menuOrderMatchesTenant,
  parseAnjunganMenuId,
  parseAnjunganMenuInput,
  parseAnjunganMenuOrder,
  tenantAnjunganMenuWhere,
} from "@/lib/anjunganConfig"
import { prisma } from "@/lib/prisma"

const moduleUrl = "anjungan_menu"
const pagePath = "/anjungan_menu"

export type AnjunganMenuActionResult =
  | { success: true }
  | { success: false; error: string }

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AnjunganInputError) return error.message
  if (error instanceof Error && error.message === "Tidak memiliki akses.") return error.message
  return fallback
}

export async function createAnjunganMenu(
  formData: FormData,
): Promise<AnjunganMenuActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const input = parseAnjunganMenuInput(formData)
    const aggregate = await prisma.anjungan_menu.aggregate({
      where: { config_id: actor.configId },
      _max: { urut: true },
    })
    const urut = (aggregate._max.urut ?? 0) + 1
    if (urut > 127) {
      return { success: false, error: "Jumlah menu telah mencapai batas penyimpanan." }
    }

    await prisma.anjungan_menu.create({
      data: {
        config_id: actor.configId,
        ...input,
        urut,
        created_by: actor.userId,
        updated_by: actor.userId,
      },
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Menu anjungan gagal disimpan.") }
  }
}

export async function updateAnjunganMenu(
  formData: FormData,
): Promise<AnjunganMenuActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseAnjunganMenuId(formData)
    const input = parseAnjunganMenuInput(formData)
    const updated = await prisma.anjungan_menu.updateMany({
      where: tenantAnjunganMenuWhere(id, actor.configId),
      data: {
        ...input,
        updated_at: new Date(),
        updated_by: actor.userId,
      },
    })

    if (updated.count !== 1) {
      return { success: false, error: "Menu tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Menu anjungan gagal diubah.") }
  }
}

export async function deleteAnjunganMenu(
  formData: FormData,
): Promise<AnjunganMenuActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "h")
    const id = parseAnjunganMenuId(formData)
    const deleted = await prisma.anjungan_menu.deleteMany({
      where: tenantAnjunganMenuWhere(id, actor.configId),
    })

    if (deleted.count !== 1) {
      return { success: false, error: "Menu tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Menu anjungan gagal dihapus.") }
  }
}

export async function reorderAnjunganMenus(
  formData: FormData,
): Promise<AnjunganMenuActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const order = parseAnjunganMenuOrder(formData)
    await prisma.$transaction(async (transaction) => {
      const tenantMenus = await transaction.anjungan_menu.findMany({
        where: { config_id: actor.configId },
        select: { id: true },
      })
      if (!menuOrderMatchesTenant(order, tenantMenus.map((menu) => menu.id))) {
        throw new AnjunganInputError(
          "Urutan menu sudah berubah. Muat ulang halaman lalu coba lagi.",
        )
      }

      for (const [index, id] of order.entries()) {
        const result = await transaction.anjungan_menu.updateMany({
          where: tenantAnjunganMenuWhere(id, actor.configId),
          data: {
            urut: index + 1,
            updated_at: new Date(),
            updated_by: actor.userId,
          },
        })
        if (result.count !== 1) {
          throw new AnjunganInputError(
            "Urutan menu gagal diperbarui karena data berubah.",
          )
        }
      }
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Urutan menu anjungan gagal disimpan.") }
  }
}
