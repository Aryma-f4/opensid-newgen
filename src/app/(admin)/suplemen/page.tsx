import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function SuplemenPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  return (
    <div>
      <ContentHeader title="Data Suplemen" breadcrumb={[{ label: "Kependudukan" }, { label: "Data Suplemen" }]} />
      <Manager statusFilter={params.status} />
    </div>
  )
}
