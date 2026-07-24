"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import { canChangePending, leaveDates, parseLeaveInput } from "@/lib/kehadiranLeave"
import { prisma } from "@/lib/prisma"

const path = "/kehadiran/pengajuan_izin"

function requestIdFrom(formData: FormData): bigint {
  const value = formData.get("request_id")
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new Error("Pengajuan izin tidak valid.")
  }

  return BigInt(value)
}

function requirePamong(pamongId: number | null): number {
  if (!pamongId) throw new Error("Akun tidak terhubung ke perangkat desa.")
  return pamongId
}

function assertPendingOwner(
  request: { config_id: number | null; id_pamong: number; status_approval: string } | null,
  configId: number,
  pamongId: number,
) {
  if (
    !request ||
    request.config_id !== configId ||
    request.id_pamong !== pamongId ||
    !canChangePending(request.status_approval)
  ) {
    throw new Error("Pengajuan izin tidak dapat diubah.")
  }
}

function detailRows(requestId: bigint, configId: number, pamongId: number, input: ReturnType<typeof parseLeaveInput>) {
  return leaveDates(input.tanggal_mulai, input.tanggal_selesai).map((tanggal) => ({
    config_id: configId,
    pengajuan_izin_id: requestId,
    tanggal,
    jenis_izin: input.jenis_izin,
    id_pamong: pamongId,
    status: "pending" as const,
  }))
}

export async function createLeaveRequest(formData: FormData) {
  const actor = await requireAdminAccess("kehadiran_pengajuan_izin_pamong", "u")
  const pamongId = requirePamong(actor.pamongId)
  const input = parseLeaveInput(formData)

  await prisma.$transaction(async (tx) => {
    const request = await tx.kehadiran_pengajuan_izin.create({
      data: {
        config_id: actor.configId,
        id_pamong: pamongId,
        ...input,
        status_approval: "pending",
      },
    })

    await tx.kehadiran_pengajuan_izin_detail.createMany({
      data: detailRows(request.id, actor.configId, pamongId, input),
    })
  })

  revalidatePath(path)
}

export async function updateLeaveRequest(formData: FormData) {
  const actor = await requireAdminAccess("kehadiran_pengajuan_izin_pamong", "u")
  const pamongId = requirePamong(actor.pamongId)
  const requestId = requestIdFrom(formData)
  const input = parseLeaveInput(formData)

  await prisma.$transaction(async (tx) => {
    const request = await tx.kehadiran_pengajuan_izin.findUnique({
      where: { id: requestId },
      select: { config_id: true, id_pamong: true, status_approval: true },
    })
    assertPendingOwner(request, actor.configId, pamongId)

    const updated = await tx.kehadiran_pengajuan_izin.updateMany({
      where: {
        id: requestId,
        config_id: actor.configId,
        id_pamong: pamongId,
        status_approval: "pending",
      },
      data: {
        jenis_izin: input.jenis_izin,
        tanggal_mulai: input.tanggal_mulai,
        tanggal_selesai: input.tanggal_selesai,
        keterangan: input.keterangan,
      },
    })
    if (updated.count !== 1) throw new Error("Pengajuan izin tidak dapat diubah.")

    await tx.kehadiran_pengajuan_izin_detail.deleteMany({
      where: {
        pengajuan_izin_id: requestId,
        config_id: actor.configId,
        id_pamong: pamongId,
      },
    })
    await tx.kehadiran_pengajuan_izin_detail.createMany({
      data: detailRows(requestId, actor.configId, pamongId, input),
    })
  })

  revalidatePath(path)
}

export async function deleteLeaveRequest(formData: FormData) {
  const actor = await requireAdminAccess("kehadiran_pengajuan_izin_pamong", "h")
  const pamongId = requirePamong(actor.pamongId)
  const requestId = requestIdFrom(formData)

  await prisma.$transaction(async (tx) => {
    const request = await tx.kehadiran_pengajuan_izin.findUnique({
      where: { id: requestId },
      select: { config_id: true, id_pamong: true, status_approval: true },
    })
    assertPendingOwner(request, actor.configId, pamongId)

    const deleted = await tx.kehadiran_pengajuan_izin.deleteMany({
      where: {
        id: requestId,
        config_id: actor.configId,
        id_pamong: pamongId,
        status_approval: "pending",
      },
    })
    if (deleted.count !== 1) throw new Error("Pengajuan izin tidak dapat dihapus.")
  })

  revalidatePath(path)
}
