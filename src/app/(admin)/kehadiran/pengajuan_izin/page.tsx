import { requireAdminAccess } from "@/lib/adminAccess"
import { prisma } from "@/lib/prisma"

import LeaveRequestManager, { type LeaveRequestRow } from "./LeaveRequestManager"

export const dynamic = "force-dynamic"

export default async function Page() {
  const actor = await requireAdminAccess("kehadiran_pengajuan_izin_pamong", "b")
  const requests = actor.pamongId
    ? await prisma.kehadiran_pengajuan_izin.findMany({
      where: { config_id: actor.configId, id_pamong: actor.pamongId },
      orderBy: { id: "desc" },
    })
    : []

  const rows: LeaveRequestRow[] = requests.map((request) => ({
    id: request.id.toString(),
    jenisIzin: request.jenis_izin,
    tanggalMulai: request.tanggal_mulai.toISOString(),
    tanggalSelesai: request.tanggal_selesai.toISOString(),
    keterangan: request.keterangan,
    status: request.status_approval,
  }))

  return <LeaveRequestManager rows={rows} />
}
