import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function DokumenDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dokumen = await prisma.dokumen.findUnique({ where: { id: parseInt(id) } })
  if (!dokumen || dokumen.deleted) notFound()

  const kategoriMap: Record<number, string> = { 1: "Identitas Penduduk", 2: "Keterangan", 3: "Lainnya" }

  const rows: [string, React.ReactNode][] = [
    ["Nama Dokumen", dokumen.nama],
    ["Tahun", dokumen.tahun?.toString() ?? "-"],
    ["Tanggal Upload", dokumen.tgl_upload?.toLocaleDateString("id-ID") ?? "-"],
    ["Kategori", kategoriMap[dokumen.kategori] ?? dokumen.kategori.toString()],
    ["Tipe", dokumen.tipe?.toString() ?? "-"],
    ["Status", dokumen.enabled ? "Aktif" : "Non-aktif"],
    ["Keterangan", dokumen.keterangan ?? "-"],
    ["Lokasi Arsip", dokumen.lokasi_arsip ? (
      <a
        key="link"
        href={`/storage/${dokumen.lokasi_arsip.replace(/^storage\//, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lte-primary hover:underline"
      >
        <i className="fa fa-download mr-1" />{dokumen.lokasi_arsip}
      </a>
    ) : "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail Dokumen" breadcrumb={[{ label: "Sekretariat", href: "/dokumen" }, { label: dokumen.nama }]} />

      <Box title={dokumen.nama} color="primary" noPadding>
        <LteTable head={<><Th>Field</Th><Th>Nilai</Th></>}>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <Td className="w-56 text-gray-500">{label}</Td>
              <Td>{value}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      {dokumen.lokasi_arsip && (
        <div className="mt-3">
          <a
            href={`/storage/${dokumen.lokasi_arsip.replace(/^storage\//, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <i className="fa fa-download" /> Download Dokumen
          </a>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Link href="/dokumen" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
