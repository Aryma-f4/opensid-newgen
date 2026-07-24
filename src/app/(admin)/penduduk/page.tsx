import { prisma } from "@/lib/prisma"
import PendudukManager from "./Manager"

export const dynamic = "force-dynamic"

const perPage = 50

export default async function PendudukPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; sex?: string; dusun?: string; status_dasar?: string; tgl_from?: string; tgl_to?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const q = params.q?.trim() ?? ""
  const sex = params.sex ? parseInt(params.sex) : undefined
  const dusun = params.dusun?.trim() || ""
  const statusDasar = params.status_dasar ? parseInt(params.status_dasar) : undefined
  const tglFrom = params.tgl_from?.trim() || ""
  const tglTo = params.tgl_to?.trim() || ""

  const where: any = {}
  if (statusDasar !== undefined) {
    where.status_dasar = statusDasar
  } else {
    where.status_dasar = 1
  }
  if (sex) where.sex = sex
  if (q) where.OR = [{ nama: { contains: q } }, { nik: { contains: q } }]
  if (dusun) {
    const clusterIds = (await prisma.tweb_wil_clusterdesa.findMany({ where: { dusun }, select: { id: true } })).map((c) => c.id)
    if (clusterIds.length > 0) where.id_cluster = { in: clusterIds }
  }
  if (tglFrom) where.created_at = { ...(where.created_at || {}), gte: new Date(tglFrom) }
  if (tglTo) where.created_at = { ...(where.created_at || {}), lte: new Date(tglTo + "T23:59:59") }

  const [penduduk, total, sexRef, agamaRef, pekerjaanRef, kawinRef, pendidikanRef, wargaRef, clusterRef] = await Promise.all([
    prisma.tweb_penduduk.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.tweb_penduduk.count({ where }),
    prisma.tweb_penduduk_sex.findMany(),
    prisma.tweb_penduduk_agama.findMany(),
    prisma.tweb_penduduk_pekerjaan.findMany(),
    prisma.tweb_penduduk_kawin.findMany(),
    prisma.tweb_penduduk_pendidikan_kk.findMany(),
    prisma.tweb_penduduk_warganegara.findMany(),
    prisma.tweb_wil_clusterdesa.findMany({ orderBy: { dusun: "asc" }, select: { id: true, dusun: true } }),
  ])

  const pages = Math.ceil(total / perPage)

  // Get unique dusun list
  const dusunList = Array.from(new Set(clusterRef.map((c: any) => c.dusun))).sort().filter(Boolean)

  return (
    <PendudukManager
      penduduk={penduduk}
      sexRef={sexRef}
      agamaRef={agamaRef}
      pekerjaanRef={pekerjaanRef}
      kawinRef={kawinRef}
      pendidikanRef={pendidikanRef}
      wargaRef={wargaRef}
      clusterRef={clusterRef}
      total={total}
      page={page}
      pages={pages}
      q={q}
      sex={sex}
      dusun={dusun}
      statusDasar={statusDasar}
      tglFrom={tglFrom}
      tglTo={tglTo}
      dusunList={dusunList}
    />
  )
}
