import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, DetailTable } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function SuratKeluarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.surat_keluar.findUnique({ where: { id: parseInt(id) } })
  if (!item) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Nomor Surat", <span key="no" className="font-mono">{item.nomor_surat ?? "-"}</span>],
    ["Kode Surat", <span key="kode" className="font-mono">{item.kode_surat ?? "-"}</span>],
    ["Tanggal Surat", item.tanggal_surat?.toLocaleDateString("id-ID") ?? "-"],
    ["Tanggal Catat", item.tanggal_catat?.toLocaleDateString("id-ID") ?? "-"],
    ["Tujuan", item.tujuan ?? "-"],
    ["Isi Singkat", item.isi_singkat ?? "-"],
    ["Tanggal Pengiriman", item.tanggal_pengiriman?.toLocaleDateString("id-ID") ?? "-"],
    ["Ekspedisi", item.ekspedisi ? "Ya" : "Tidak"],
    ["Tanda Terima", item.tanda_terima ?? "-"],
    ["Keterangan", item.keterangan ?? "-"],
    ["Berkas Scan", item.berkas_scan ? (
      <a key="scan" href={`/storage/${item.berkas_scan}`} target="_blank" rel="noopener noreferrer" className="text-lte-primary hover:underline">
        <i className="fa fa-download mr-1" />{item.berkas_scan}
      </a>
    ) : "-"],
    ["Lokasi Arsip", item.lokasi_arsip || "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Surat Keluar" breadcrumb={[{ label: "Surat Keluar", href: "/surat_keluar" }, { label: item.nomor_surat ?? `#${id}` }]} />

      <Box title={`Surat ${item.nomor_surat ?? ""}`} noPadding>
        <DetailTable rows={rows} />
      </Box>

      <div className="mt-3 flex gap-2">
        <Link href="/surat_keluar" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
