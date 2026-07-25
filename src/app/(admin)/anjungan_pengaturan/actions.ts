"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import {
  activeAnjunganGalleryIds,
  ANJUNGAN_SETTING_KEYS,
  AnjunganInputError,
  parseAnjunganSettings,
} from "@/lib/anjunganConfig"
import { prisma } from "@/lib/prisma"

const moduleUrl = "anjungan_pengaturan"
const pagePath = "/anjungan_pengaturan"

export type AnjunganSettingsActionResult =
  | { success: true }
  | { success: false; error: string }

function errorMessage(error: unknown): string {
  if (error instanceof AnjunganInputError) return error.message
  if (error instanceof Error && error.message === "Tidak memiliki akses.") return error.message
  return "Pengaturan anjungan gagal disimpan."
}

export async function updateAnjunganSettings(
  formData: FormData,
): Promise<AnjunganSettingsActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const updates = parseAnjunganSettings(formData)
    const articleIds = JSON.parse(updates.anjungan_artikel) as number[]
    const galleryIds = activeAnjunganGalleryIds(updates)

    const [categoryCount, galleryCount, settingRows] = await Promise.all([
      articleIds.length === 0
        ? Promise.resolve(0)
        : prisma.kategori.count({
          where: {
            config_id: actor.configId,
            id: { in: articleIds },
          },
        }),
      galleryIds.length === 0
        ? Promise.resolve(0)
        : prisma.gambar_gallery.count({
          where: {
            config_id: actor.configId,
            id: { in: [...new Set(galleryIds)] },
            parrent: 0,
            enabled: 1,
          },
        }),
      prisma.setting_aplikasi.findMany({
        where: {
          config_id: actor.configId,
          key: { in: [...ANJUNGAN_SETTING_KEYS] },
        },
        select: { key: true },
      }),
    ])

    if (categoryCount !== articleIds.length) {
      return { success: false, error: "Kategori artikel tidak tersedia pada tenant ini." }
    }
    if (galleryCount !== new Set(galleryIds).size) {
      return { success: false, error: "Galeri tidak tersedia pada tenant ini." }
    }

    const existingKeys = new Set(settingRows.map((row) => row.key).filter(Boolean))
    const missingKeys = ANJUNGAN_SETTING_KEYS.filter((key) => !existingKeys.has(key))
    if (missingKeys.length > 0) {
      return {
        success: false,
        error: `Penyimpanan lokal belum tersedia untuk: ${missingKeys.join(", ")}.`,
      }
    }

    await prisma.$transaction(async (transaction) => {
      for (const [key, value] of Object.entries(updates)) {
        const result = await transaction.setting_aplikasi.updateMany({
          where: {
            config_id: actor.configId,
            key,
          },
          data: { value },
        })
        if (result.count !== 1) {
          throw new AnjunganInputError(`Pengaturan ${key} gagal diperbarui.`)
        }
      }
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
}
