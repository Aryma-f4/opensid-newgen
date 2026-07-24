import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function KeluargaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const keluarga = await prisma.tweb_keluarga.findUnique({
    where: { id: parseInt(id) },
    include: {
      tweb_penduduk_tweb_keluarga_nik_kepalaTotweb_penduduk: { select: { nama: true, nik: true } },
      tweb_wil_clusterdesa: { select: { dusun: true, rw: true, rt: true } },
    },
  })
  if (!keluarga) notFound()

  const anggota = await prisma.tweb_penduduk.findMany({
    where: { id_kk: parseInt(id) },
    select: { id: true, nik: true, nama: true, sex: true, tanggallahir: true, kk_level: true },
    orderBy: { id: "asc" },
  })

  const hubunganMap = new Map(
    (await prisma.tweb_penduduk_hubungan.findMany()).map((h: any) => [h.id, h.nama ?? "-"])
  )
  const sexMap = new Map(
    (await prisma.tweb_penduduk_sex.findMany()).map((s: any) => [s.id, s.nama ?? "-"])
  )

  const rows: [string, React.ReactNode][] = [
    ["No. KK", <span key="kk" className="font-mono">{keluarga.no_kk ?? "-"}</span>],
    ["Kepala Keluarga", keluarga.tweb_penduduk_tweb_keluarga_nik_kepalaTotweb_penduduk?.nama ?? "-"],
    ["NIK Kepala", keluarga.tweb_penduduk_tweb_keluarga_nik_kepalaTotweb_penduduk?.nik ?? "-"],
    ["Alamat", keluarga.alamat ?? "-"],
    ["Dusun", keluarga.tweb_wil_clusterdesa?.dusun ?? "-"],
    ["RW", keluarga.tweb_wil_clusterdesa?.rw ?? "-"],
    ["RT", keluarga.tweb_wil_clusterdesa?.rt ?? "-"],
    ["Tanggal Daftar", keluarga.tgl_daftar?.toLocaleDateString("id-ID") ?? "-"],
    ["Kelas Sosial", keluarga.kelas_sosial?.toString() ?? "-"],
    ["Tanggal Cetak KK", keluarga.tgl_cetak_kk?.toLocaleDateString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Keluarga" breadcrumb={[{ label: "Kependudukan", href: "/keluarga" }, { label: `KK ${keluarga.no_kk}` }]} />

      <Box title="Data Keluarga" color="primary" noPadding>
        <LteTable head={<><Th>Field</Th><Th>Nilai</Th></>}>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <Td className="w-56 text-gray-500">{label}</Td>
              <Td>{value}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <div className="mt-4">
        <Box title={`Anggota Keluarga (${anggota.length})`} color="success" noPadding
          tools={
            <div className="flex gap-1">
              <Link href={`/keluarga/${id}/cetak_kk`} className="btn btn-default btn-xs">
                <i className="fa fa-print" /> Cetak KK
              </Link>
            </div>
          }
        >
          <LteTable head={<><Th>NIK</Th><Th>Nama</Th><Th>L/P</Th><Th>Tanggal Lahir</Th><Th>Hubungan</Th><Th>Aksi</Th></>}>
            {anggota.length === 0 ? (
              <tr><Td colSpan={6} className="text-center py-4 text-gray-400">Tidak ada anggota</Td></tr>
            ) : anggota.map((a) => (
              <tr key={a.id}>
                <Td className="font-mono">{a.nik}</Td>
                <Td><Link href={`/penduduk/${a.id}`} className="text-lte-primary hover:underline">{a.nama}</Link></Td>
                <Td>{sexMap.get(a.sex) ?? "-"}</Td>
                <Td>{a.tanggallahir?.toLocaleDateString("id-ID") ?? "-"}</Td>
                <Td>{hubunganMap.get(a.kk_level ?? 0) ?? "-"}</Td>
                <Td>
                  <Link href={`/penduduk/${a.id}`}><Btn color="primary" size="xs">Detail</Btn></Link>
                </Td>
              </tr>
            ))}
          </LteTable>
        </Box>
      </div>

      <div className="mt-3 flex gap-2">
        <Link href="/keluarga" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
