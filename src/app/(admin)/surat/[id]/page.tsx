import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function SuratDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const surat = await prisma.tweb_surat_format.findUnique({ where: { id: parseInt(id) } })
  if (!surat) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Kode Surat", <span key="kode" className="font-mono">{surat.kode_surat ?? "-"}</span>],
    ["Nama", surat.nama ?? "-"],
    ["URL Surat", surat.url_surat ?? "-"],
    ["Jenis", surat.jenis?.toString() ?? "-"],
    ["Lampiran", surat.lampiran ?? "-"],
    ["Masa Berlaku", surat.masa_berlaku ? `${surat.masa_berlaku} ${surat.satuan_masa_berlaku ?? ""}` : "-"],
    ["Kunci", surat.kunci ? "Ya" : "Tidak"],
    ["Favorit", surat.favorit ? "Ya" : "Tidak"],
    ["Mandiri", surat.mandiri ? "Ya" : "Tidak"],
    ["QR Code", surat.qr_code ? "Ya" : "Tidak"],
    ["QR Code TTE", surat.qr_code_tte ? "Ya" : "Tidak"],
    ["Logo Garuda", surat.logo_garuda ? "Ya" : "Tidak"],
    ["Format Nomor Global", surat.format_nomor_global ? "Ya" : "Tidak"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Format Surat" breadcrumb={[{ label: "Sekretariat", href: "/surat" }, { label: surat.nama ?? `Surat ${id}` }]} />

      <Box title={surat.nama ?? "Format Surat"} color="primary" noPadding>
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
        <Link href="/surat" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
