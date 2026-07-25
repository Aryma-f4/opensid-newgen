"use server"

import { revalidatePath } from "next/cache"

import type { Prisma } from "@/generated/prisma"
import { requireAdminAccess } from "@/lib/adminAccess"
import {
  AdminDomainInputError,
  canActivatePamongRole,
  canDeletePamong,
  parseAdminRecordId,
  parseBinaryStatusChange,
  parsePamongInput,
  parsePamongStatusChange,
  tenantPamongWhere,
} from "@/lib/adminDomainScope"
import { prisma } from "@/lib/prisma"

const moduleUrl = "pengurus/clear"
const pagePath = "/pengurus"

export type PamongActionResult =
  | { success: true }
  | { success: false; error: string }

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AdminDomainInputError) return error.message
  if (error instanceof Error && error.message === "Tidak memiliki akses.") return error.message
  return fallback
}

async function requireTenantJob(
  transaction: Prisma.TransactionClient,
  jabatanId: number,
  configId: number,
) {
  const jobs = await transaction.$queryRaw<Array<{ id: number; jenis: number }>>`
    SELECT id, CAST(jenis AS UNSIGNED) AS jenis
    FROM ref_jabatan
    WHERE id = ${jabatanId}
      AND config_id = ${configId}
    FOR UPDATE
  `
  const job = jobs[0]
  if (!job) throw new AdminDomainInputError("Jabatan tidak tersedia pada tenant ini.")
  return Number(job.jenis)
}

async function ensureSpecialRoleAvailable(
  transaction: Prisma.TransactionClient,
  jabatanId: number,
  status: 1 | 2,
  configId: number,
  excludedPamongId = 0,
) {
  const roleKind = await requireTenantJob(transaction, jabatanId, configId)
  if (status !== 1 || (roleKind !== 1 && roleKind !== 2)) return

  await transaction.$queryRaw`
    SELECT id
    FROM ref_jabatan
    WHERE config_id = ${configId}
      AND CAST(jenis AS UNSIGNED) = ${roleKind}
    FOR UPDATE
  `
  const peers = await transaction.$queryRaw<Array<{ pamong_id: number }>>`
    SELECT p.pamong_id
    FROM tweb_desa_pamong p
    INNER JOIN ref_jabatan j
      ON j.id = p.jabatan_id
     AND j.config_id = p.config_id
    WHERE p.config_id = ${configId}
      AND CAST(j.jenis AS UNSIGNED) = ${roleKind}
      AND CAST(p.pamong_status AS UNSIGNED) = 1
      AND p.pamong_id <> ${excludedPamongId}
    LIMIT 1
    FOR UPDATE
  `
  if (!canActivatePamongRole(roleKind, peers.length > 0)) {
    throw new AdminDomainInputError(
      roleKind === 1
        ? "Kepala Desa aktif sudah tersedia. Nonaktifkan pejabat lama terlebih dahulu."
        : "Sekretaris Desa aktif sudah tersedia. Nonaktifkan pejabat lama terlebih dahulu.",
    )
  }
}

export async function createPamong(formData: FormData): Promise<PamongActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const input = parsePamongInput(formData)
    const { pamong_status, ...data } = input

    await prisma.$transaction(async (transaction) => {
      await ensureSpecialRoleAvailable(
        transaction,
        input.jabatan_id,
        pamong_status,
        actor.configId,
      )
      const aggregate = await transaction.tweb_desa_pamong.aggregate({
        where: { config_id: actor.configId },
        _max: { urut: true },
      })
      const pamong = await transaction.tweb_desa_pamong.create({
        data: {
          config_id: actor.configId,
          ...data,
          pamong_status: true,
          pamong_tgl_terdaftar: new Date(),
          urut: (aggregate._max.urut ?? 0) + 1,
        },
        select: { pamong_id: true },
      })

      await transaction.$executeRaw`
        UPDATE tweb_desa_pamong
        SET pamong_status = ${pamong_status}
        WHERE pamong_id = ${pamong.pamong_id}
          AND config_id = ${actor.configId}
      `
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Pamong gagal disimpan.") }
  }
}

export async function updatePamong(formData: FormData): Promise<PamongActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseAdminRecordId(formData)
    const input = parsePamongInput(formData)
    const { pamong_status, ...data } = input

    await prisma.$transaction(async (transaction) => {
      const existing = await transaction.tweb_desa_pamong.findFirst({
        where: tenantPamongWhere(id, actor.configId),
        select: { id_pend: true },
      })
      if (!existing) {
        throw new AdminDomainInputError("Pamong tidak ditemukan pada tenant ini.")
      }
      await ensureSpecialRoleAvailable(
        transaction,
        input.jabatan_id,
        pamong_status,
        actor.configId,
        id,
      )
      const { pamong_nama, pamong_nik, ...nonIdentityData } = data
      const updated = await transaction.tweb_desa_pamong.updateMany({
        where: tenantPamongWhere(id, actor.configId),
        data: existing.id_pend === null
          ? { ...nonIdentityData, pamong_nama, pamong_nik }
          : nonIdentityData,
      })
      if (updated.count !== 1) {
        throw new AdminDomainInputError("Pamong tidak ditemukan pada tenant ini.")
      }

      await transaction.$executeRaw`
        UPDATE tweb_desa_pamong
        SET pamong_status = ${pamong_status}
        WHERE pamong_id = ${id}
          AND config_id = ${actor.configId}
      `
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Pamong gagal diubah.") }
  }
}

export async function changePamongStatus(
  formData: FormData,
): Promise<PamongActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseAdminRecordId(formData)
    const status = parsePamongStatusChange(formData)
    await prisma.$transaction(async (transaction) => {
      const record = await transaction.tweb_desa_pamong.findFirst({
        where: tenantPamongWhere(id, actor.configId),
        select: { pamong_id: true, jabatan_id: true },
      })
      if (!record) {
        throw new AdminDomainInputError("Pamong tidak ditemukan pada tenant ini.")
      }
      if (status === 1 && record.jabatan_id === null) {
        throw new AdminDomainInputError("Jabatan pamong wajib diisi sebelum diaktifkan.")
      }
      if (status === 1 && record.jabatan_id !== null) {
        await ensureSpecialRoleAvailable(
          transaction,
          record.jabatan_id,
          status,
          actor.configId,
          id,
        )
      }

      await transaction.$executeRaw`
        UPDATE tweb_desa_pamong
        SET pamong_status = ${status}
        WHERE pamong_id = ${id}
          AND config_id = ${actor.configId}
      `
    })

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Status pamong gagal diubah.") }
  }
}

export async function changePamongAttendance(
  formData: FormData,
): Promise<PamongActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "u")
    const id = parseAdminRecordId(formData)
    const status = parseBinaryStatusChange(formData)
    const updated = await prisma.tweb_desa_pamong.updateMany({
      where: tenantPamongWhere(id, actor.configId),
      data: { kehadiran: status },
    })
    if (updated.count !== 1) {
      return { success: false, error: "Pamong tidak ditemukan pada tenant ini." }
    }

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Status kehadiran gagal diubah.") }
  }
}

export async function deletePamong(formData: FormData): Promise<PamongActionResult> {
  try {
    const actor = await requireAdminAccess(moduleUrl, "h")
    const id = parseAdminRecordId(formData)
    const result = await prisma.$transaction(async (transaction) => {
      const locked = await transaction.$queryRaw<Array<{ pamong_id: number }>>`
        SELECT pamong_id
        FROM tweb_desa_pamong
        WHERE pamong_id = ${id}
          AND config_id = ${actor.configId}
        FOR UPDATE
      `
      if (locked.length !== 1) {
        return { success: false as const, error: "Pamong tidak ditemukan pada tenant ini." }
      }

      const record = await transaction.tweb_desa_pamong.findFirst({
        where: tenantPamongWhere(id, actor.configId),
        select: {
          foto: true,
          _count: {
            select: {
              disposisi_surat_masuk: true,
              kehadiran_pengaduan: true,
              kehadiran_pengajuan_izin: true,
              kehadiran_pengajuan_izin_detail: true,
              kehadiran_perangkat_desa: true,
              log_surat: true,
              user: true,
            },
          },
        },
      })
      if (!record) {
        return { success: false as const, error: "Pamong tidak ditemukan pada tenant ini." }
      }

      const dependencyCount = Object.values(record._count)
        .reduce((total, count) => total + count, 0)
      if (!canDeletePamong(dependencyCount, Boolean(record.foto))) {
        return {
          success: false as const,
          error: record.foto
            ? "Pamong memiliki foto yang masih dikelola layanan berkas lama. Nonaktifkan pamong sampai pemindahan berkas tersedia."
            : "Pamong masih digunakan oleh layanan surat, pengguna, atau data kehadiran. Nonaktifkan pamong untuk mempertahankan riwayat.",
        }
      }

      const deleted = await transaction.tweb_desa_pamong.deleteMany({
        where: tenantPamongWhere(id, actor.configId),
      })
      if (deleted.count !== 1) {
        return { success: false as const, error: "Pamong tidak ditemukan pada tenant ini." }
      }
      return { success: true as const }
    })
    if (!result.success) return result

    revalidatePath(pagePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, "Pamong gagal dihapus.") }
  }
}
