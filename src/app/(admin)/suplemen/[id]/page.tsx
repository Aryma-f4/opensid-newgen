import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const sasaranLabel: Record<number, string> = { 1: "Penduduk", 2: "Keluarga" }

export default async function SuplemenDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.suplemen.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const terdata = await prisma.suplemen_terdata.findMany({
    where: { id_suplemen: item.id },
    include: {
      tweb_penduduk: { select: { id: true, nik: true, nama: true } },
      tweb_keluarga: { select: { id: true, no_kk: true } },
    },
    orderBy: { id: "asc" },
    take: 500,
  })

  const rows: [string, React.ReactNode][] = [
    ["Nama", item.nama ?? "-"],
    ["Sasaran", sasaranLabel[item.sasaran ?? 0] ?? "-"],
    ["Keterangan", item.keterangan ?? "-"],
    ["Status", <StatusLabel key="s" ok={item.status === 1} />],
    ["Jumlah Terdata", String(terdata.length)],
  ]

  return (
    <div>
      <ContentHeader title="Detail Suplemen" breadcrumb={[{ label: "Data Suplemen", href: "/suplemen" }, { label: item.nama ?? "-" }]} />

      <Box title="Data Suplemen" color="primary" noPadding>
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
        <Box title={`Data Terdata (${terdata.length})`} color="success" noPadding>
          <LteTable head={<><Th>No</Th><Th>Sasaran</Th><Th>Nama</Th><Th>ID / NIK</Th><Th>Keterangan</Th></>}>
            {terdata.length === 0 ? (
              <tr><Td colSpan={5} className="text-center py-4 text-gray-400">Belum ada data terdata</Td></tr>
            ) : terdata.map((t, i) => {
              const sasaran = sasaranLabel[t.sasaran ?? 0] ?? "-"
              const nama = t.tweb_penduduk?.nama ?? t.tweb_keluarga?.no_kk ?? "-"
              const linkId = t.penduduk_id
                ? `/penduduk/${t.penduduk_id}`
                : t.keluarga_id
                  ? `/keluarga/${t.keluarga_id}`
                  : null
              const idLabel = t.tweb_penduduk?.nik ?? t.tweb_keluarga?.no_kk ?? t.id_terdata ?? "-"
              return (
                <tr key={t.id}>
                  <Td>{i + 1}</Td>
                  <Td>{sasaran}</Td>
                  <Td>{linkId ? <Link href={linkId} className="text-lte-primary hover:underline">{nama}</Link> : nama}</Td>
                  <Td className="font-mono">{idLabel}</Td>
                  <Td>{t.keterangan ?? "-"}</Td>
                </tr>
              )
            })}
          </LteTable>
        </Box>
      </div>

      <div className="mt-3 flex gap-2">
        <Link href="/suplemen" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
