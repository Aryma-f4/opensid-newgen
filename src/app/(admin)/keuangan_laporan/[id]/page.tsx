import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function KeuanganLaporanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // keuangan.id is BigInt, handle both BigInt and regular number
  const item = await prisma.keuangan.findUnique({ where: { id: BigInt(id) } })
  if (!item) notFound()

  const template = item.template_uuid
    ? await prisma.keuangan_template.findUnique({ where: { uuid: item.template_uuid } }).catch(() => null)
    : null

  const rows: [string, React.ReactNode][] = [
    ["Tahun", item.tahun],
    ["Anggaran", `Rp ${Number(item.anggaran).toLocaleString("id-ID")}`],
    ["Realisasi", `Rp ${Number(item.realisasi).toLocaleString("id-ID")}`],
    ["Template", template?.uraian ?? item.template_uuid],
    ["Dibuat", item.created_at?.toLocaleString("id-ID") ?? "-"],
    ["Diubah", item.updated_at?.toLocaleString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Laporan Keuangan" breadcrumb={[{ label: "Laporan Keuangan", href: "/keuangan_laporan" }, { label: `${item.tahun}` }]} />

      <Box title={`Laporan Keuangan ${item.tahun}`} color="primary" noPadding>
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
        <Link href="/keuangan_laporan" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
