import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function KeuanganLaporanPage({ searchParams }: { searchParams: Promise<{ tahun?: string }> }) {
  const params = await searchParams
  return (
    <div>
      <ContentHeader title="Laporan Keuangan Desa" breadcrumb={[{ label: "Keuangan" }, { label: "Laporan Keuangan" }]} />
      <Manager tahunFilter={params.tahun} />
    </div>
  )
}
