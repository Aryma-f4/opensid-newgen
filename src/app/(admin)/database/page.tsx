import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import DatabaseManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function DatabasePage() {
  const [rows, count] = await Promise.all([
    prisma.migrasi.findMany({ orderBy: { id: "desc" }, take: 100 }),
    prisma.migrasi.count(),
  ])

  return (
    <div>
      <ContentHeader
        title="Database"
        subtitle="Migrasi Database"
        breadcrumb={[{ label: "Pengaturan" }, { label: "Database" }]}
      />
      <DatabaseManager migrations={rows as any[]} count={count} />
    </div>
  )
}
