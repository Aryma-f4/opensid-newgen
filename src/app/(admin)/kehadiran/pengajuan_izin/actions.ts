"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/adminAccess"
import {
  canChangePending,
  leaveDates,
  type LeaveRequestErrorCode,
  parseLeaveInput,
} from "@/lib/kehadiranLeave"
import { prisma } from "@/lib/prisma"

const path = "/kehadiran/pengajuan_izin"

export type LeaveRequestActionResult =
  | { success: true }
  | { success: false; error: LeaveRequestErrorCode }

class LeaveRequestActionError extends Error {
  constructor(readonly code: LeaveRequestErrorCode) {
    super(code)
  }
}

function actionError(code: LeaveRequestErrorCode): never {
  throw new LeaveRequestActionError(code)
}

async function actionResult(
  fallbackError: LeaveRequestErrorCode,
  operation: () => Promise<void>,
): Promise<LeaveRequestActionResult> {
  try {
    await operation()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof LeaveRequestActionError ? error.code : fallbackError,
    }
  }
}

function requestIdFrom(formData: FormData): bigint {
  const value = formData.get("request_id")
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    actionError("invalid_request")
  }

  return BigInt(value)
}

function requirePamong(pamongId: number | null): number {
  if (!pamongId) actionError("account_unlinked")
  return pamongId
}

async function leaveActor(required: "u" | "h") {
  try {
    return await requireAdminAccess("kehadiran_pengajuan_izin_pamong", required)
  } catch {
    actionError("access_denied")
  }
}

function leaveInput(formData: FormData) {
  try {
    return parseLeaveInput(formData)
  } catch {
    actionError("invalid_input")
  }
}

function assertPendingOwner(
  request: { config_id: number | null; id_pamong: number; status_approval: string } | null,
  configId: number,
  pamongId: number,
  error: "cannot_change" | "cannot_delete",
) {
  if (
    !request ||
    request.config_id !== configId ||
    request.id_pamong !== pamongId ||
    !canChangePending(request.status_approval)
  ) {
    actionError(error)
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

export async function createLeaveRequest(formData: FormData): Promise<LeaveRequestActionResult> {
  return actionResult("save_failed", async () => {
    const actor = await leaveActor("u")
    const pamongId = requirePamong(actor.pamongId)
    const input = leaveInput(formData)

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
  })
}

export async function updateLeaveRequest(formData: FormData): Promise<LeaveRequestActionResult> {
  return actionResult("save_failed", async () => {
    const actor = await leaveActor("u")
    const pamongId = requirePamong(actor.pamongId)
    const requestId = requestIdFrom(formData)
    const input = leaveInput(formData)

    await prisma.$transaction(async (tx) => {
      const request = await tx.kehadiran_pengajuan_izin.findUnique({
        where: { id: requestId },
        select: { config_id: true, id_pamong: true, status_approval: true },
      })
      assertPendingOwner(request, actor.configId, pamongId, "cannot_change")

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
      if (updated.count !== 1) actionError("cannot_change")

      await tx.kehadiran_pengajuan_izin_detail.deleteMany({
        where: { pengajuan_izin_id: requestId },
      })
      await tx.kehadiran_pengajuan_izin_detail.createMany({
        data: detailRows(requestId, actor.configId, pamongId, input),
      })
    })

    revalidatePath(path)
  })
}

export async function deleteLeaveRequest(formData: FormData): Promise<LeaveRequestActionResult> {
  return actionResult("delete_failed", async () => {
    const actor = await leaveActor("h")
    const pamongId = requirePamong(actor.pamongId)
    const requestId = requestIdFrom(formData)

    await prisma.$transaction(async (tx) => {
      const request = await tx.kehadiran_pengajuan_izin.findUnique({
        where: { id: requestId },
        select: { config_id: true, id_pamong: true, status_approval: true },
      })
      assertPendingOwner(request, actor.configId, pamongId, "cannot_delete")

      const deleted = await tx.kehadiran_pengajuan_izin.deleteMany({
        where: {
          id: requestId,
          config_id: actor.configId,
          id_pamong: pamongId,
          status_approval: "pending",
        },
      })
      if (deleted.count !== 1) actionError("cannot_delete")
    })

    revalidatePath(path)
  })
}
