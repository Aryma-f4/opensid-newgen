import { prisma } from "@/lib/prisma"
import RtmManager from "./Manager"

export const dynamic = "force-dynamic"

const perPage = 50

export default async function RtmPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const q = params.q?.trim() ?? ""
  const where: any = q
    ? { OR: [{ no_kk: { contains: q } }, { tweb_penduduk: { nama: { contains: q } } }] }
    : {}

  const [rtm, total, sejahteraRef, penduduk] = await Promise.all([
    prisma.tweb_rtm.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { tweb_penduduk: { select: { nama: true, nik: true, id: true } } },
    }),
    prisma.tweb_rtm.count({ where }),
    prisma.tweb_keluarga_sejahtera.findMany().then((r) => r.map((x) => ({ id: x.id, nama: x.nama ?? "" }))),
    prisma.tweb_penduduk.findMany({
      where: { status_dasar: 1 },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" },
      take: 5000,
    }),
  ])

  const anggota = await prisma.tweb_penduduk.groupBy({
    by: ["id_rtm"],
    where: { id_rtm: { in: rtm.map((r) => r.no_kk) } },
    _count: { _all: true },
  })
  const anggotaMap = new Map(anggota.map((a) => [a.id_rtm, a._count._all]))

  const data = rtm.map((r) => ({
    id: r.id,
    no_kk: r.no_kk,
    nik_kepala: r.nik_kepala,
    tgl_daftar: r.tgl_daftar,
    kelas_sosial: r.kelas_sosial,
    terdaftar_dtks: r.terdaftar_dtks,
    kepala: r.tweb_penduduk?.nama ?? null,
    nik: r.tweb_penduduk?.nik ?? null,
    kepalaId: r.tweb_penduduk?.id ?? null,
    anggotaCount: anggotaMap.get(r.no_kk) ?? 0,
  }))

  const pages = Math.ceil(total / perPage)

  return (
    <RtmManager
      data={data}
      total={total}
      page={page}
      pages={pages}
      q={q}
      sejahteraRef={sejahteraRef}
      pendudukRef={penduduk}
    />
  )
}
