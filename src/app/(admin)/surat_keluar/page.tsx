import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default async function SuratKeluarPage({ searchParams }: { searchParams: Promise<{ tgl_from?: string; tgl_to?: string }> }) {
  const params = await searchParams
  return (
    <div>
      <ContentHeader title="Surat Keluar" breadcrumb={[{ label: "Sekretariat" }, { label: "Surat Keluar" }]} />
      <Manager tglFrom={params.tgl_from} tglTo={params.tgl_to} />
    </div>
  )
}
