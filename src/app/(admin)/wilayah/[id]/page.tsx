import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function WilayahDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cluster = await prisma.tweb_wil_clusterdesa.findUnique({
    where: { id: parseInt(id) },
    include: {
      tweb_penduduk_tweb_wil_clusterdesa_id_kepalaTotweb_penduduk: { select: { nama: true, nik: true } },
    },
  })
  if (!cluster) notFound()

  const [totalPenduduk, totalKeluarga] = await Promise.all([
    prisma.tweb_penduduk.count({ where: { id_cluster: cluster.id, status_dasar: 1 } }),
    prisma.tweb_keluarga.count({ where: { id_cluster: cluster.id } }),
  ])

  const rows: [string, React.ReactNode][] = [
    ["Dusun", cluster.dusun ?? "-"],
    ["RW", cluster.rw ?? "-"],
    ["RT", cluster.rt ?? "-"],
    ["Kepala Wilayah", cluster.tweb_penduduk_tweb_wil_clusterdesa_id_kepalaTotweb_penduduk?.nama ?? "-"],
    ["NIK Kepala", cluster.tweb_penduduk_tweb_wil_clusterdesa_id_kepalaTotweb_penduduk?.nik ?? "-"],
    ["Total Penduduk", totalPenduduk.toLocaleString("id-ID")],
    ["Total Keluarga", totalKeluarga.toLocaleString("id-ID")],
  ]

  return (
    <div>
      <ContentHeader title="Detail Wilayah" breadcrumb={[{ label: "Kependudukan", href: "/wilayah" }, { label: `${cluster.dusun} - ${cluster.rw}/${cluster.rt}` }]} />

      <Box title="Data Wilayah" color="primary" noPadding>
        <LteTable head={<><Th>Field</Th><Th>Nilai</Th></>}>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <Td className="w-56 text-gray-500">{label}</Td>
              <Td>{value}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <div className="mt-3 flex gap-2">
        <Link href="/wilayah" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
