import { requireAdminAccess } from "@/lib/adminAccess"
import { prisma } from "@/lib/prisma"

import AnjunganMenuManager, { type AnjunganMenuRow } from "./AnjunganMenuManager"

export const dynamic = "force-dynamic"

const moduleUrl = "anjungan_menu"

export default async function AnjunganMenuPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, canUpdate, canDelete] = await Promise.all([
    prisma.anjungan_menu.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ urut: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nama: true,
        icon: true,
        link: true,
        link_tipe: true,
        urut: true,
        status: true,
      },
    }),
    requireAdminAccess(moduleUrl, "u").then(() => true, () => false),
    requireAdminAccess(moduleUrl, "h").then(() => true, () => false),
  ])

  const rows: AnjunganMenuRow[] = records.map((record) => ({
    id: record.id,
    nama: record.nama,
    icon: record.icon,
    link: record.link,
    linkTipe: record.link_tipe,
    urut: record.urut,
    status: record.status === 1,
  }))

  return (
    <AnjunganMenuManager
      rows={rows}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}
