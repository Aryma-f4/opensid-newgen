"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess, type AdminActor } from "@/lib/adminAccess"
import {
  approvalMutationWhere,
  canDecideLeaveRequest,
  missingAttendanceDates,
  parseDecisionNote,
  type ApprovalActionCode,
  type ApprovalActionResult,
} from "@/lib/kehadiranApproval"
import { canChangePending, leaveDates } from "@/lib/kehadiranLeave"
import { prisma } from "@/lib/prisma"

const path = "/kehadiran/persetujuan_izin"

class ApprovalActionError extends Error {
  constructor(readonly code: ApprovalActionCode) {
    super(code)
  }
}

function actionError(code: ApprovalActionCode): never {
  throw new ApprovalActionError(code)
}

async function actionResult(
  successCode: "approved" | "rejected",
  fallbackCode: "approve_failed" | "reject_failed",
  operation: () => Promise<void>,
): Promise<ApprovalActionResult> {
  try {
    await operation()
    return { success: true, code: successCode }
  } catch (error) {
    return {
      success: false,
      code: error instanceof ApprovalActionError ? error.code : fallbackCode,
    }
  }
}

async function approvalActor(): Promise<AdminActor> {
  try {
    return await requireAdminAccess("kehadiran_pengajuan_izin", "u")
  } catch {
    actionError("access_denied")
  }
}

function requestIdFrom(formData: FormData): bigint {
  const value = formData.get("request_id")
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    actionError("invalid_request")
  }

  return BigInt(value)
}

function decisionNoteFrom(formData: FormData): string | null {
  try {
    return parseDecisionNote(formData)
  } catch {
    actionError("invalid_input")
  }
}

type DecisionRequest = {
  config_id: number | null
  status_approval: string
  tweb_desa_pamong: { atasan: number | null }
}

function assertDecisionAllowed(
  actor: AdminActor,
  request: DecisionRequest | null,
): asserts request is DecisionRequest {
  if (!request || request.config_id !== actor.configId) {
    actionError("not_allowed")
  }
  if (!canChangePending(request.status_approval)) {
    actionError("not_pending")
  }
  if (
    !canDecideLeaveRequest(actor, {
      configId: request.config_id,
      supervisorId: request.tweb_desa_pamong.atasan,
      status: request.status_approval,
    })
  ) {
    actionError("not_allowed")
  }
}

export async function approveLeaveRequest(
  formData: FormData,
): Promise<ApprovalActionResult> {
  return actionResult("approved", "approve_failed", async () => {
    const actor = await approvalActor()
    const requestId = requestIdFrom(formData)
    const note = decisionNoteFrom(formData)

    await prisma.$transaction(async (tx) => {
      const updated = await tx.kehadiran_pengajuan_izin.updateMany({
        where: {
          id: requestId,
          ...approvalMutationWhere(actor),
        },
        data: {
          status_approval: "approved",
          approved_by: actor.userId,
          tanggal_approval: new Date(),
          keterangan_approval: note,
        },
      })
      if (updated.count !== 1) {
        const current = await tx.kehadiran_pengajuan_izin.findUnique({
          where: { id: requestId },
          select: {
            config_id: true,
            status_approval: true,
            tweb_desa_pamong: { select: { atasan: true } },
          },
        })
        assertDecisionAllowed(actor, current)
        actionError("not_pending")
      }

      const request = await tx.kehadiran_pengajuan_izin.findUnique({
        where: { id: requestId },
        select: {
          id_pamong: true,
          jenis_izin: true,
          tanggal_mulai: true,
          tanggal_selesai: true,
        },
      })
      if (!request) actionError("approve_failed")

      await tx.kehadiran_pengajuan_izin_detail.updateMany({
        where: { pengajuan_izin_id: requestId },
        data: { status: "approved" },
      })

      const dates = leaveDates(request.tanggal_mulai, request.tanggal_selesai)
      const existingAttendance = await tx.kehadiran_perangkat_desa.findMany({
        where: {
          config_id: actor.configId,
          pamong_id: request.id_pamong,
          tanggal: { in: dates },
        },
        select: { tanggal: true },
      })
      const missingDates = missingAttendanceDates(
        request.tanggal_mulai,
        request.tanggal_selesai,
        existingAttendance.flatMap((row) => row.tanggal ? [row.tanggal] : []),
      )

      if (missingDates.length > 0) {
        await tx.kehadiran_perangkat_desa.createMany({
          data: missingDates.map((tanggal) => ({
            config_id: actor.configId,
            pamong_id: request.id_pamong,
            tanggal,
            status_kehadiran: request.jenis_izin,
          })),
          skipDuplicates: true,
        })
      }
    })

    revalidatePath(path)
  })
}

export async function rejectLeaveRequest(
  formData: FormData,
): Promise<ApprovalActionResult> {
  return actionResult("rejected", "reject_failed", async () => {
    const actor = await approvalActor()
    const requestId = requestIdFrom(formData)
    const note = decisionNoteFrom(formData)

    await prisma.$transaction(async (tx) => {
      const updated = await tx.kehadiran_pengajuan_izin.updateMany({
        where: {
          id: requestId,
          ...approvalMutationWhere(actor),
        },
        data: {
          status_approval: "rejected",
          approved_by: actor.userId,
          tanggal_approval: new Date(),
          keterangan_approval: note,
        },
      })
      if (updated.count !== 1) {
        const current = await tx.kehadiran_pengajuan_izin.findUnique({
          where: { id: requestId },
          select: {
            config_id: true,
            status_approval: true,
            tweb_desa_pamong: { select: { atasan: true } },
          },
        })
        assertDecisionAllowed(actor, current)
        actionError("not_pending")
      }

      await tx.kehadiran_pengajuan_izin_detail.updateMany({
        where: { pengajuan_izin_id: requestId },
        data: { status: "rejected" },
      })
    })

    revalidatePath(path)
  })
}
