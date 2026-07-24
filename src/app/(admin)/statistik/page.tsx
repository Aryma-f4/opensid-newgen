import { prisma } from "@/lib/prisma"
import { ContentHeader, SmallBox, Box, LteTable, Th, Td } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function StatistikPage() {
  const [totalPenduduk, sexRef, agamaRef, pekerjaanRef, kawinRef, pendidikanRef, golDarRef, sexCounts, agamaCounts, pekerjaanCounts, kawinCounts, pendidikanCounts, golDarCounts] =
    await Promise.all([
      prisma.tweb_penduduk.count({ where: { status_dasar: 1 } }),
      prisma.tweb_penduduk_sex.findMany(),
      prisma.tweb_penduduk_agama.findMany(),
      prisma.tweb_penduduk_pekerjaan.findMany(),
      prisma.tweb_penduduk_kawin.findMany(),
      prisma.tweb_penduduk_pendidikan_kk.findMany(),
      prisma.tweb_golongan_darah.findMany(),
      prisma.tweb_penduduk.groupBy({ by: ["sex"], where: { status_dasar: 1 }, _count: true }),
      prisma.tweb_penduduk.groupBy({ by: ["agama_id"], where: { status_dasar: 1 }, _count: true }),
      prisma.tweb_penduduk.groupBy({ by: ["pekerjaan_id"], where: { status_dasar: 1 }, _count: true }),
      prisma.tweb_penduduk.groupBy({ by: ["status_kawin"], where: { status_dasar: 1 }, _count: true }),
      prisma.tweb_penduduk.groupBy({ by: ["pendidikan_kk_id"], where: { status_dasar: 1 }, _count: true }),
      prisma.tweb_penduduk.groupBy({ by: ["golongan_darah_id"], where: { status_dasar: 1 }, _count: true }),
    ])

  return (
    <div>
      <ContentHeader title="Statistik Penduduk" breadcrumb={[{ label: "Kependudukan" }, { label: "Statistik" }]} />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-4">
        <SmallBox value={totalPenduduk.toLocaleString("id-ID")} label="Total Penduduk" icon="fa-users" color="aqua" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatTable title="Jenis Kelamin" data={sexRef} counts={sexCounts} labelKey="nama" idKey="id" countKey="sex" total={totalPenduduk} />
        <StatTable title="Agama" data={agamaRef} counts={agamaCounts} labelKey="nama" idKey="id" countKey="agama_id" total={totalPenduduk} />
        <StatTable title="Pekerjaan" data={pekerjaanRef} counts={pekerjaanCounts} labelKey="nama" idKey="id" countKey="pekerjaan_id" total={totalPenduduk} />
        <StatTable title="Status Kawin" data={kawinRef} counts={kawinCounts} labelKey="nama" idKey="id" countKey="status_kawin" total={totalPenduduk} />
        <StatTable title="Pendidikan (KK)" data={pendidikanRef} counts={pendidikanCounts} labelKey="nama" idKey="id" countKey="pendidikan_kk_id" total={totalPenduduk} />
        <StatTable title="Golongan Darah" data={golDarRef} counts={golDarCounts} labelKey="nama" idKey="id" countKey="golongan_darah_id" total={totalPenduduk} />
      </div>
    </div>
  )
}

function StatTable({
  title, data, counts, labelKey, idKey, countKey, total,
}: {
  title: string
  data: any[]
  counts: { _count: number; [key: string]: any }[]
  labelKey: string
  idKey: string
  countKey: string
  total: number
}) {
  const countMap = new Map(counts.map((c) => [c[countKey], c._count]))
  const maxCount = Math.max(...counts.map((c) => c._count), 1)
  return (
    <Box title={title} noPadding>
      <LteTable
        head={
          <>
            <Th>Nama</Th>
            <Th>Jumlah</Th>
            <Th>Persen</Th>
          </>
        }
      >
        {data.map((d) => {
          const count = countMap.get(d[idKey]) ?? 0
          const pct = total ? ((count / total) * 100).toFixed(1) : "0.0"
          return (
            <tr key={d[idKey]}>
              <Td>{d[labelKey]}</Td>
              <Td className="text-right font-medium">{count.toLocaleString("id-ID")}</Td>
              <Td className="text-right text-gray-500">{pct}%</Td>
            </tr>
          )
        })}
      </LteTable>
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-[#f4f4f4]">
        Skala relatif terhadap kategori paling banyak: {maxCount.toLocaleString("id-ID")}
      </div>
    </Box>
  )
}
