import { prisma } from "@/lib/prisma"
import KelompokManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function KelompokPage() {
  const [kelompok, masterRef, penduduk] = await Promise.all([
    prisma.kelompok.findMany({
      where: { tipe: "kelompok" },
      orderBy: { id: "asc" },
      include: {
        kelompok_master: { select: { kelompok: true } },
        tweb_penduduk: { select: { id: true, nama: true } },
        kelompok_anggota: { select: { id: true } },
      },
    }),
    prisma.kelompok_master.findMany({
      where: { tipe: "kelompok" },
      orderBy: { kelompok: "asc" },
    }),
    prisma.tweb_penduduk.findMany({
      where: { status_dasar: 1 },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" },
      take: 5000,
    }),
  ])

  const data = kelompok.map((k) => ({
    id: k.id,
    kode: k.kode,
    nama: k.nama,
    id_master: k.id_master,
    id_ketua: k.id_ketua,
    keterangan: k.keterangan,
    no_sk_pendirian: k.no_sk_pendirian,
    kategori: k.kelompok_master.kelompok,
    ketua: k.tweb_penduduk?.nama ?? null,
    anggotaCount: k.kelompok_anggota.length,
  }))

  const pendudukRef = penduduk.map((p) => ({ id: p.id, nama: `${p.nama} (${p.nik})` }))

  return <KelompokManager data={data} masterRef={masterRef} pendudukRef={pendudukRef} />
}
