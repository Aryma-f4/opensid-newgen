"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import {
  BukuTamuConfigInputError,
  canDeleteQuestion,
  parseConfigRecordId,
  parseQuestionInput,
  tenantOwnedWhere,
} from "@/lib/bukuTamuConfig"
import { prisma } from "@/lib/prisma"

const moduleUrl = "buku_pertanyaan"
const pagePath = "/buku_pertanyaan"

export type QuestionActionResult =
  | { success: true }
  | { success: false; error: string }

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof BukuTamuConfigInputError) return error.message
  if (error instanceof Error && error.message === "Tidak memiliki akses.") return error.message
  return fallback
}

export async function createQuestion(formData: FormData): Promise<QuestionActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const input = parseQuestionInput(formData)

    await prisma.buku_pertanyaan.create({
      data: {
        config_id: actor.configId,
        pertanyaan: input.pertanyaan,
        status: input.status,
      },
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Pertanyaan gagal disimpan.") }
  }
}

export async function updateQuestion(formData: FormData): Promise<QuestionActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseConfigRecordId(formData)
    const input = parseQuestionInput(formData)
    const updated = await prisma.buku_pertanyaan.updateMany({
      where: tenantOwnedWhere(id, actor.configId),
      data: {
        pertanyaan: input.pertanyaan,
        status: input.status,
      },
    })

    if (updated.count !== 1) {
      return { success: false, error: "Pertanyaan tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Pertanyaan gagal diubah.") }
  }
}

export async function deleteQuestion(formData: FormData): Promise<QuestionActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "h")
    const id = parseConfigRecordId(formData)
    const response = await prisma.buku_kepuasan.findFirst({
      where: {
        config_id: actor.configId,
        id_pertanyaan: id,
      },
      select: { id: true },
    })

    if (!canDeleteQuestion(response !== null)) {
      return {
        success: false,
        error: "Pertanyaan sudah memiliki jawaban kepuasan. Nonaktifkan pertanyaan untuk mempertahankan jawaban asli.",
      }
    }

    const deleted = await prisma.buku_pertanyaan.deleteMany({
      where: {
        ...tenantOwnedWhere(id, actor.configId),
        buku_kepuasan: { none: {} },
      },
    })

    if (deleted.count !== 1) {
      return {
        success: false,
        error: "Pertanyaan tidak ditemukan atau baru saja menerima jawaban kepuasan.",
      }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Pertanyaan gagal dihapus.") }
  }
}
