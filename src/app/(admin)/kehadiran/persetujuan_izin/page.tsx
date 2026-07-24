import { requireAdminAccess } from "@/lib/adminAccess"
import { approvalQueueWhere } from "@/lib/kehadiranApproval"
import { prisma } from "@/lib/prisma"

import LeaveApprovalManager, {
  type LeaveApprovalRow,
} from "./LeaveApprovalManager"

export const dynamic = "force-dynamic"

export default async function Page() {
  const actor = await requireAdminAccess("kehadiran_pengajuan_izin", "b")
  let canUpdate = false
  try {
    await requireAdminAccess("kehadiran_pengajuan_izin", "u")
    canUpdate = true
  } catch {
    // Read access still permits the actor-scoped queue without decision controls.
  }

  const requests = await prisma.kehadiran_pengajuan_izin.findMany({
    where: approvalQueueWhere(actor),
    orderBy: { id: "desc" },
    take: 100,
    select: {
      id: true,
      id_pamong: true,
      jenis_izin: true,
      tanggal_mulai: true,
      tanggal_selesai: true,
      keterangan: true,
      status_approval: true,
      tanggal_approval: true,
      keterangan_approval: true,
      tweb_desa_pamong: { select: { pamong_nama: true } },
      user: { select: { nama: true, username: true } },
    },
  })

  const rows: LeaveApprovalRow[] = requests.map((request) => ({
    id: request.id.toString(),
    requester:
      request.tweb_desa_pamong.pamong_nama ??
      `Perangkat #${request.id_pamong}`,
    leaveType: request.jenis_izin,
    startDate: request.tanggal_mulai.toISOString(),
    endDate: request.tanggal_selesai.toISOString(),
    requestNote: request.keterangan,
    status: request.status_approval,
    approver: request.user?.nama ?? request.user?.username ?? null,
    decidedAt: request.tanggal_approval?.toISOString() ?? null,
    decisionNote: request.keterangan_approval,
  }))

  return <LeaveApprovalManager rows={rows} canUpdate={canUpdate} />
}
