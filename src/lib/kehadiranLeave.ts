import type { kehadiran_pengajuan_izin_jenis_izin } from "@/generated/prisma/enums"

const leaveTypes = ["cuti", "sakit", "izin", "dinas_luar_kota", "lainnya"] as const satisfies readonly kehadiran_pengajuan_izin_jenis_izin[]

export type LeaveInput = {
  jenis_izin: kehadiran_pengajuan_izin_jenis_izin
  tanggal_mulai: Date
  tanggal_selesai: Date
  keterangan: string
}

const leaveRequestErrorMessages = {
  invalid_input: "Periksa jenis izin, tanggal, dan keterangan.",
  invalid_request: "Pengajuan izin tidak valid.",
  account_unlinked: "Akun tidak terhubung ke perangkat desa.",
  access_denied: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
  cannot_change: "Pengajuan izin tidak dapat diubah.",
  cannot_delete: "Pengajuan izin tidak dapat dihapus.",
  save_failed: "Pengajuan izin tidak dapat disimpan. Silakan coba lagi.",
  delete_failed: "Pengajuan izin tidak dapat dihapus. Silakan coba lagi.",
} as const

export type LeaveRequestErrorCode = keyof typeof leaveRequestErrorMessages

export function leaveRequestErrorMessage(code: LeaveRequestErrorCode): string {
  return leaveRequestErrorMessages[code]
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function parseDateOnly(value: string, field: "mulai" | "selesai"): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error(`Tanggal ${field} tidak valid.`)

  const [, year, month, day] = match
  const date = new Date(0)
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day))
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`Tanggal ${field} tidak valid.`)
  }

  return date
}

export function parseLeaveInput(formData: FormData): LeaveInput {
  const jenisIzin = readText(formData, "jenis_izin")
  if (!leaveTypes.includes(jenisIzin as (typeof leaveTypes)[number])) {
    throw new Error("Jenis izin tidak valid.")
  }

  const keterangan = readText(formData, "keterangan")
  if (!keterangan) throw new Error("Keterangan wajib diisi.")

  const tanggal_mulai = parseDateOnly(readText(formData, "tanggal_mulai"), "mulai")
  const tanggal_selesai = parseDateOnly(readText(formData, "tanggal_selesai"), "selesai")
  if (tanggal_selesai < tanggal_mulai) {
    throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai.")
  }

  const days = (tanggal_selesai.getTime() - tanggal_mulai.getTime()) / 86_400_000 + 1
  if (days > 366) throw new Error("Rentang izin maksimal 366 hari.")

  return {
    jenis_izin: jenisIzin as kehadiran_pengajuan_izin_jenis_izin,
    tanggal_mulai,
    tanggal_selesai,
    keterangan,
  }
}

export function leaveDates(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())

  while (current.getTime() <= last) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

export function canChangePending(status: string): boolean {
  return status === "pending"
}
