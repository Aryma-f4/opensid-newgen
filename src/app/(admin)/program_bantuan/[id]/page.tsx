import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const sasaranLabel: Record<number, string> = { 1: "Penduduk", 2: "Keluarga", 3: "Rumah Tangga", 4: "Kelompok" }

export default async function ProgramBantuanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.program.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const peserta = await prisma.program_peserta.findMany({
    where: { program_id: item.id },
    orderBy: { id: "asc" },
    take: 500,
  })

  const sasaranName = sasaranLabel[item.sasaran] ?? String(item.sasaran)

  const rows: [string, React.ReactNode][] = [
    ["Nama Program", item.nama],
    ["Sasaran", sasaranName],
    ["Tgl Mulai", item.sdate?.toLocaleDateString("id-ID") ?? "-"],
    ["Tgl Selesai", item.edate?.toLocaleDateString("id-ID") ?? "-"],
    ["Asal Dana", item.asaldana ?? "-"],
    ["Keterangan", item.ndesc ?? "-"],
    ["Dibuat", item.created_at?.toLocaleString("id-ID") ?? "-"],
    ["Diubah", item.updated_at?.toLocaleString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Program Bantuan" breadcrumb={[{ label: "Program Bantuan", href: "/program_bantuan" }, { label: item.nama }]} />

      <Box title="Data Program" color="primary" noPadding>
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
        <Box title={`Peserta (${peserta.length})`} color="success" noPadding
          tools={
            <a
              href={`/api/program_bantuan/${id}/export`}
              className="btn btn-default btn-xs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-download" /> Export CSV
            </a>
          }
        >
          <LteTable head={<><Th>No</Th><Th>NIK</Th><Th>Nama</Th><Th>Tempat Lahir</Th><Th>Tgl Lahir</Th><Th>Alamat</Th><Th>No. Kartu</Th></>}>
            {peserta.length === 0 ? (
              <tr><Td colSpan={7} className="text-center py-4 text-gray-400">Belum ada peserta</Td></tr>
            ) : peserta.map((p, i) => (
              <tr key={p.id}>
                <Td>{i + 1}</Td>
                <Td className="font-mono">{p.kartu_nik}</Td>
                <Td>{p.kartu_nama}</Td>
                <Td>{p.kartu_tempat_lahir}</Td>
                <Td>{p.kartu_tanggal_lahir?.toLocaleDateString("id-ID") ?? "-"}</Td>
                <Td>{p.kartu_alamat}</Td>
                <Td>{p.no_id_kartu ?? "-"}</Td>
              </tr>
            ))}
          </LteTable>
        </Box>
      </div>

      <div className="mt-3 flex gap-2">
        <Link href="/program_bantuan" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
