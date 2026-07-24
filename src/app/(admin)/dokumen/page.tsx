import { prisma } from "@/lib/prisma"
import DokumenManager from "./Manager"
import { ContentHeader } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const perPage = 30

export default async function DokumenPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; tahun?: string; kategori?: string; dusun?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const q = params.q?.trim() ?? ""
  const tahun = params.tahun?.trim() || ""
  const kategori = params.kategori?.trim() || ""
  const dusun = params.dusun?.trim() || ""

  const where: any = { deleted: false }
  if (q) where.nama = { contains: q }
  if (tahun) where.tahun = parseInt(tahun)
  if (kategori) where.kategori = parseInt(kategori)

  // If dusun filter is active, first find penduduk IDs in that cluster
  if (dusun) {
    const clusterIds = await prisma.tweb_wil_clusterdesa.findMany({
      where: { dusun: { contains: dusun } },
      select: { id: true },
    })
    const pendudukIds = await prisma.tweb_penduduk.findMany({
      where: { id_cluster: { in: clusterIds.map((c) => c.id) } },
      select: { id: true },
    })
    where.id_pend = { in: pendudukIds.map((p) => p.id) }
  }

  const [dokumen, total] = await Promise.all([
    prisma.dokumen.findMany({
      where,
      orderBy: { tgl_upload: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.dokumen.count({ where }),
  ])

  const data = dokumen.map((d) => ({
    id: d.id,
    nama: d.nama,
    tahun: d.tahun,
    tgl_upload: d.tgl_upload,
    lokasi_arsip: d.lokasi_arsip,
    enabled: d.enabled,
    kategori: d.kategori,
    tipe: d.tipe ?? 1,
    keterangan: d.keterangan,
  }))

  // Get dusun list for filter dropdown
  const dusunList = await prisma.tweb_wil_clusterdesa.findMany({
    where: { dusun: { not: "0" } },
    select: { dusun: true },
    distinct: ["dusun"],
    orderBy: { dusun: "asc" },
  })

  return (
    <div>
      <ContentHeader title="Dokumen" subtitle="Arsip Dokumen Desa" breadcrumb={[{ label: "Sekretariat" }, { label: "Dokumen" }]} />
      <DokumenManager data={data} total={total} search={q} tahun={tahun} kategori={kategori} dusun={dusun} dusunList={dusunList.map((d) => d.dusun)} pages={Math.ceil(total / perPage)} page={page} />
    </div>
  )
}
