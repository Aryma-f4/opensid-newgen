import { requireAdminAccess } from "@/lib/adminAccess"
import { prisma } from "@/lib/prisma"

import BukuPertanyaanManager, { type QuestionRow } from "./BukuPertanyaanManager"

export const dynamic = "force-dynamic"

const moduleUrl = "buku_pertanyaan"

export default async function BukuPertanyaanPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, canUpdate, canDelete] = await Promise.all([
    prisma.buku_pertanyaan.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ pertanyaan: "asc" }, { id: "asc" }],
      select: { id: true, pertanyaan: true, status: true },
    }),
    requireAdminAccess(moduleUrl, "u").then(() => true, () => false),
    requireAdminAccess(moduleUrl, "h").then(() => true, () => false),
  ])

  const rows: QuestionRow[] = records.map((record) => ({
    id: record.id,
    pertanyaan: record.pertanyaan ?? "",
    status: record.status,
  }))

  return (
    <BukuPertanyaanManager
      rows={rows}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}
