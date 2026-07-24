import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, DetailTable, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function SuratDinasDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.surat_dinas.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Nama", item.nama],
    ["Kode Surat", <span key="kode" className="font-mono">{item.kode_surat ?? "-"}</span>],
    ["URL Surat", item.url_surat],
    ["Jenis", item.jenis === 2 ? "Desa" : "Sistem"],
    ["Lampiran", item.lampiran ?? "-"],
    ["Kunci", item.kunci ? "Ya" : "Tidak"],
    ["Favorit", item.favorit ? "Ya" : "Tidak"],
    ["QR Code", item.qr_code ? "Ya" : "Tidak"],
    ["Logo Garuda", item.logo_garuda ? "Ya" : "Tidak"],
    ["Masa Berlaku", item.masa_berlaku ? `${item.masa_berlaku} ${item.satuan_masa_berlaku ?? ""}` : "-"],
    ["Format Nomor", item.format_nomor ?? "-"],
    ["Orientasi", item.orientasi ?? "-"],
    ["Ukuran", item.ukuran ?? "-"],
    ["Dibuat", item.created_at?.toLocaleString("id-ID") ?? "-"],
    ["Diubah", item.updated_at?.toLocaleString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Surat Dinas" breadcrumb={[{ label: "Surat Dinas", href: "/surat_dinas" }, { label: item.nama }]} />

      <Box title={item.nama} noPadding>
        <DetailTable rows={rows} />
      </Box>

      <div className="mt-3 flex gap-2">
        <Link href="/surat_dinas" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
