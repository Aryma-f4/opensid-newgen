import { canChangePending, leaveDates } from "./kehadiranLeave"

const approvalActionMessages = {
  approved: "Pengajuan izin disetujui.",
  rejected: "Pengajuan izin ditolak.",
  invalid_request: "Pengajuan izin tidak valid.",
  invalid_input: "Catatan keputusan tidak valid.",
  access_denied: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
  not_pending: "Pengajuan izin sudah diputuskan.",
  not_allowed: "Anda tidak dapat memutuskan pengajuan izin ini.",
  approve_failed: "Pengajuan izin tidak dapat disetujui. Silakan coba lagi.",
  reject_failed: "Pengajuan izin tidak dapat ditolak. Silakan coba lagi.",
} as const

export type ApprovalActionCode = keyof typeof approvalActionMessages

export type ApprovalActionResult = {
  success: boolean
  code: ApprovalActionCode
}

export type ApprovalActorScope = {
  configId: number
  pamongId: number | null
  isSuperAdmin: boolean
}

export type LeaveDecisionScope = {
  configId: number | null
  supervisorId: number | null
  status: string
}

export function approvalActionMessage(code: ApprovalActionCode): string {
  return approvalActionMessages[code]
}

export function parseDecisionNote(formData: FormData): string | null {
  const value = formData.get("decision_note")
  if (value !== null && typeof value !== "string") {
    throw new Error("Catatan keputusan tidak valid.")
  }

  const note = value?.trim() ?? ""
  if (note.length > 1000) {
    throw new Error("Catatan keputusan maksimal 1000 karakter.")
  }

  return note || null
}

export function approvalQueueWhere(actor: ApprovalActorScope) {
  if (actor.isSuperAdmin) return { config_id: actor.configId }

  return {
    config_id: actor.configId,
    tweb_desa_pamong: { atasan: actor.pamongId ?? -1 },
  }
}

export function approvalMutationWhere(actor: ApprovalActorScope) {
  if (actor.isSuperAdmin) {
    return {
      config_id: actor.configId,
      status_approval: "pending" as const,
    }
  }

  return {
    config_id: actor.configId,
    status_approval: "pending" as const,
    tweb_desa_pamong: { atasan: actor.pamongId ?? -1 },
  }
}

export function canDecideLeaveRequest(
  actor: ApprovalActorScope,
  request: LeaveDecisionScope,
): boolean {
  if (
    request.configId !== actor.configId ||
    !canChangePending(request.status)
  ) {
    return false
  }

  return actor.isSuperAdmin ||
    (actor.pamongId !== null && request.supervisorId === actor.pamongId)
}

function dateKey(date: Date): string {
  return [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
  ].join("-")
}

export function missingAttendanceDates(
  start: Date,
  end: Date,
  existingDates: readonly Date[],
): Date[] {
  const existing = new Set(existingDates.map(dateKey))
  return leaveDates(start, end).filter((date) => !existing.has(dateKey(date)))
}
