import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function KelompokDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const itemId = parseInt(id)
  if (isNaN(itemId)) notFound()

  const item = await prisma.kelompok.findFirst({
    where: { id: itemId },
    include: {
      kelompok_master: { select: { kelompok: true } },
      tweb_penduduk: { select: { nama: true, nik: true } },
    },
  })
  if (!item) notFound()

  const anggota = await prisma.kelompok_anggota.findMany({
    where: { id_kelompok: itemId },
    include: { tweb_penduduk: { select: { id: true, nik: true, nama: true } } },
    orderBy: { id: "asc" },
  })

  const rows: [string, React.ReactNode][] = [
    ["Kode", item.kode ?? "-"],
    ["Nama", item.nama ?? "-"],
    ["Kategori", (item as any).kelompok_master?.kelompok ?? "-"],
    ["Tipe", item.tipe ?? "-"],
    ["Ketua", (item as any).tweb_penduduk?.nama ? `${(item as any).tweb_penduduk.nama} (${(item as any).tweb_penduduk.nik})` : "-"],
    ["No. SK Pendirian", item.no_sk_pendirian ?? "-"],
    ["Keterangan", item.keterangan ?? "-"],
    ["Jumlah Anggota", String(anggota.length)],
  ]

  return (
    <div>
      <ContentHeader title="Detail Kelompok" breadcrumb={[{ label: "Kelompok", href: "/kelompok" }, { label: item.nama ?? "Detail" }]} />

      <Box title="Data Kelompok" color="primary" noPadding>
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <td className="w-56 text-gray-500 align-top py-2 px-3 font-medium">{label}</td>
                  <td className="py-2 px-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>

      <div className="mt-4">
        <Box title={`Anggota Kelompok (${anggota.length})`} color="success" noPadding>
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover">
              <thead><tr><Th>NIK</Th><Th>Nama</Th><Th>Aksi</Th></tr></thead>
              <tbody>
                {anggota.length === 0 ? (
                  <tr><Td colSpan={3} className="text-center py-4 text-gray-400">Tidak ada anggota</Td></tr>
                ) : anggota.map((a: any) => (
                  <tr key={a.id}>
                    <Td className="font-mono">{a.tweb_penduduk?.nik ?? "-"}</Td>
                    <Td><Link href={`/penduduk/${a.tweb_penduduk?.id}`} className="text-lte-primary hover:underline">{a.tweb_penduduk?.nama ?? "-"}</Link></Td>
                    <Td><Link href={`/penduduk/${a.tweb_penduduk?.id}`}><Btn color="primary" size="xs">Detail</Btn></Link></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      </div>

      <div className="mt-3 flex gap-2">
        <Link href="/kelompok" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
