import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function PendudukLogPage({ searchParams }: { searchParams: Promise<{ tgl_from?: string; tgl_to?: string }> }) {
  const params = await searchParams
  return (
    <div>
      <ContentHeader title="Log Penduduk" breadcrumb={[{ label: "Kependudukan" }, { label: "Log Penduduk" }]} />
      <Manager tglFrom={params.tgl_from} tglTo={params.tgl_to} />
    </div>
  )
}
