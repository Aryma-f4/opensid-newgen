import { requireAdminAccess } from "@/lib/adminAccess"
import { prisma } from "@/lib/prisma"

import BukuKeperluanManager, { type NeedRow } from "./BukuKeperluanManager"

export const dynamic = "force-dynamic"

const moduleUrl = "buku_keperluan"

export default async function BukuKeperluanPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, canUpdate, canDelete] = await Promise.all([
    prisma.buku_keperluan.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ keperluan: "asc" }, { id: "asc" }],
      select: { id: true, keperluan: true, status: true },
    }),
    requireAdminAccess(moduleUrl, "u").then(() => true, () => false),
    requireAdminAccess(moduleUrl, "h").then(() => true, () => false),
  ])

  const rows: NeedRow[] = records.map((record) => ({
    id: record.id,
    keperluan: record.keperluan,
    status: record.status,
  }))

  return (
    <BukuKeperluanManager
      rows={rows}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}
