import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function ProgramBantuanPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  return (
    <div>
      <ContentHeader title="Program Bantuan" breadcrumb={[{ label: "Bantuan" }, { label: "Program Bantuan" }]} />
      <Manager statusFilter={params.status} />
    </div>
  )
}
