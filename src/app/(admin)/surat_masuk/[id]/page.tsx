import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, DetailTable } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function SuratMasukDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.surat_masuk.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Nomor Surat", <span key="no" className="font-mono">{item.nomor_surat ?? "-"}</span>],
    ["Kode Surat", <span key="kode" className="font-mono">{item.kode_surat ?? "-"}</span>],
    ["Tanggal Surat", item.tanggal_surat?.toLocaleDateString("id-ID") ?? "-"],
    ["Tanggal Penerimaan", item.tanggal_penerimaan?.toLocaleDateString("id-ID") ?? "-"],
    ["Pengirim", item.pengirim ?? "-"],
    ["Isi Singkat", item.isi_singkat ?? "-"],
    ["Isi Disposisi", item.isi_disposisi ?? "-"],
    ["Lokasi Arsip", item.lokasi_arsip || "-"],
    ["Berkas Scan", item.berkas_scan ? (
      <a key="scan" href={`/storage/${item.berkas_scan}`} target="_blank" rel="noopener noreferrer" className="text-lte-primary hover:underline">
        <i className="fa fa-download mr-1" />{item.berkas_scan}
      </a>
    ) : "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Surat Masuk" breadcrumb={[{ label: "Surat Masuk", href: "/surat_masuk" }, { label: item.nomor_surat ?? `#${id}` }]} />

      <Box title={`Surat ${item.nomor_surat ?? ""}`} noPadding>
        <DetailTable rows={rows} />
      </Box>

      <div className="mt-3 flex gap-2">
        <Link href="/surat_masuk" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
