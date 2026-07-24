import { ContentHeader, Box, SmallBox } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function KeluargaPage({ searchParams }: { searchParams: Promise<{ dusun?: string; kelas_sosial?: string }> }) {
  const params = await searchParams
  const dusun = params.dusun?.trim() || ""
  const kelasSosial = params.kelas_sosial?.trim() || ""

  const [total, clusterRef] = await Promise.all([
    prisma.tweb_keluarga.count(),
    prisma.tweb_wil_clusterdesa.findMany({ orderBy: { dusun: "asc" }, select: { dusun: true } }),
  ])

  const dusunList = Array.from(new Set(clusterRef.map((c) => c.dusun))).sort().filter(Boolean)

  return (
    <div>
      <ContentHeader title="Keluarga" subtitle="Daftar Keluarga" breadcrumb={[{ label: "Kependudukan" }, { label: "Keluarga" }]} />

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <SmallBox value={total.toLocaleString("id-ID")} label="Total Keluarga" icon="fa-users" color="blue" />
      </div>

      <Manager
        initialDusun={dusun}
        initialKelasSosial={kelasSosial}
        dusunList={dusunList}
      />
    </div>
  )
}
