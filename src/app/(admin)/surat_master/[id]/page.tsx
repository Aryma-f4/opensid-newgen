import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, DetailTable } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const jenisLabel: Record<number, string> = { 1: "Sistem", 2: "Desa", 3: "Disabled", 4: "RTF Sistem" }

export default async function SuratMasterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.tweb_surat_format.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Kode Surat", <span key="kode" className="font-mono">{item.kode_surat ?? "-"}</span>],
    ["Nama", item.nama],
    ["URL Surat", item.url_surat],
    ["Jenis", jenisLabel[item.jenis] ?? String(item.jenis)],
    ["Lampiran", item.lampiran ?? "-"],
    ["Masa Berlaku", item.masa_berlaku ? `${item.masa_berlaku} ${item.satuan_masa_berlaku ?? ""}` : "-"],
    ["Kunci", item.kunci ? "Ya" : "Tidak"],
    ["Favorit", item.favorit ? "Ya" : "Tidak"],
    ["Mandiri", item.mandiri ? "Ya" : "Tidak"],
    ["QR Code", item.qr_code ? "Ya" : "Tidak"],
    ["QR Code TTE", item.qr_code_tte ? "Ya" : "Tidak"],
    ["Logo Garuda", item.logo_garuda ? "Ya" : "Tidak"],
    ["Format Nomor Global", item.format_nomor_global ? "Ya" : "Tidak"],
    ["Orientasi", item.orientasi ?? "-"],
    ["Ukuran", item.ukuran ?? "-"],
    ["Dibuat", item.created_at?.toLocaleString("id-ID") ?? "-"],
    ["Diubah", item.updated_at?.toLocaleString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Format Surat" breadcrumb={[{ label: "Pengaturan Surat", href: "/surat_master" }, { label: item.nama }]} />

      <Box title={item.nama} noPadding>
        <DetailTable rows={rows} />
      </Box>

      <div className="mt-3 flex gap-2">
        <Link href="/surat_master" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
