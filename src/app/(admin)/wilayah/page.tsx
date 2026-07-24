import { prisma } from "@/lib/prisma"
import WilayahManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function WilayahPage() {
  const [clusters, penduduk] = await Promise.all([
    prisma.tweb_wil_clusterdesa.findMany({
      orderBy: [{ dusun: "asc" }, { rw: "asc" }, { rt: "asc" }],
      include: {
        tweb_penduduk_tweb_wil_clusterdesa_id_kepalaTotweb_penduduk: { select: { id: true, nama: true } },
      },
    }),
    prisma.tweb_penduduk.findMany({
      where: { status_dasar: 1 },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" },
      take: 5000,
    }),
  ])

  const data = clusters.map((c) => ({
    id: c.id,
    dusun: c.dusun,
    rw: c.rw,
    rt: c.rt,
    id_kepala: c.id_kepala,
    dusun_rw_rt: `${c.dusun} - ${c.rw}/${c.rt}`,
    kepala: c.tweb_penduduk_tweb_wil_clusterdesa_id_kepalaTotweb_penduduk?.nama ?? null,
  }))

  const pendudukRef = penduduk.map((p) => ({ id: p.id, nama: `${p.nama} (${p.nik})` }))

  const dusunCount = new Set(clusters.filter((c) => c.dusun !== "-").map((c) => c.dusun)).size
  const rwCount = new Set(clusters.filter((c) => c.rw !== "0").map((c) => `${c.dusun}|${c.rw}`)).size
  const rtCount = clusters.filter((c) => c.rt !== "0").length

  return (
    <WilayahManager
      data={data}
      pendudukRef={pendudukRef}
      dusunCount={dusunCount}
      rwCount={rwCount}
      rtCount={rtCount}
    />
  )
}
