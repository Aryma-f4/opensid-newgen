import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContentHeader } from "@/components/admin/Ui"
import Link from "next/link"

export const dynamic = "force-dynamic"

// Parity with original Beranda: grid small-box dari tabel `shortcut` (judul, icon,
// warna, urut) dengan jumlah dihitung seperti app/Models/Shortcut.php.
export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/siteman")

  const shortcuts = await prisma.shortcut.findMany({
    where: { status: 1 },
    orderBy: { urut: "asc" },
  })

  const counts = await getCounts(shortcuts.map((s) => s.judul))

  return (
    <div>
      <ContentHeader title="Tentang OpenSID" breadcrumb={[{ label: "Tentang OpenSID" }]} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((s) => (
          <div key={s.id.toString()} className="rounded-[5px] text-white relative overflow-hidden" style={{ backgroundColor: s.warna ?? "#3c8dbc" }}>
            <div className="p-3 pb-8">
              <h3 className="text-4xl font-bold whitespace-nowrap">{(counts[s.judul] ?? 0).toLocaleString("id-ID")}</h3>
              <p className="mt-1 text-sm">{s.judul}</p>
            </div>
            <div className="absolute top-2 right-3 text-[70px] text-black/15 z-0">
              <i className={`fa ${s.icon ?? "fa-cube"}`} />
            </div>
            <Link href={linkFor(s.judul)} className="relative z-10 block text-center text-sm py-1 bg-black/10 hover:bg-black/20 text-white/90 rounded-b-[5px]">
              Lihat Detail <i className="fa fa-arrow-circle-right" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function linkFor(judul: string): string {
  const map: Record<string, string> = {
    Dusun: "/wilayah",
    Penduduk: "/penduduk",
    "Penduduk Laki-laki": "/penduduk?sex=1",
    "Penduduk Perempuan": "/penduduk?sex=2",
    Keluarga: "/keluarga",
    "Kepala Keluarga": "/keluarga",
    "Kepala Keluarga Laki-laki": "/keluarga?sex=1",
    "Kepala Keluarga Perempuan": "/keluarga?sex=2",
    RTM: "/rtm",
    "Kepala RTM": "/rtm",
  }
  return map[judul] ?? "/beranda"
}

async function getCounts(juduls: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {}
  const need = (j: string) => juduls.includes(j)

  const tasks: Promise<void>[] = []
  if (need("Dusun")) {
    tasks.push(
      prisma.tweb_wil_clusterdesa
        .findMany({ where: { dusun: { not: "-" }, rt: "0", rw: "0" }, select: { dusun: true } })
        .then((r) => { result["Dusun"] = new Set(r.map((x) => x.dusun)).size }),
    )
  }
  if (need("Penduduk")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1 } }).then((n) => { result["Penduduk"] = n }))
  if (need("Penduduk Laki-laki")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1, sex: 1 } }).then((n) => { result["Penduduk Laki-laki"] = n }))
  if (need("Penduduk Perempuan")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1, sex: 2 } }).then((n) => { result["Penduduk Perempuan"] = n }))
  if (need("Keluarga")) tasks.push(prisma.tweb_keluarga.count().then((n) => { result["Keluarga"] = n }))
  if (need("Kepala Keluarga")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1, kk_level: 1 } }).then((n) => { result["Kepala Keluarga"] = n }))
  if (need("Kepala Keluarga Laki-laki")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1, kk_level: 1, sex: 1 } }).then((n) => { result["Kepala Keluarga Laki-laki"] = n }))
  if (need("Kepala Keluarga Perempuan")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1, kk_level: 1, sex: 2 } }).then((n) => { result["Kepala Keluarga Perempuan"] = n }))
  if (need("RTM")) tasks.push(prisma.tweb_rtm.count().then((n) => { result["RTM"] = n }))
  if (need("Kepala RTM")) tasks.push(prisma.tweb_penduduk.count({ where: { status_dasar: 1, rtm_level: 1 } }).then((n) => { result["Kepala RTM"] = n }))

  await Promise.all(tasks)
  return result
}
