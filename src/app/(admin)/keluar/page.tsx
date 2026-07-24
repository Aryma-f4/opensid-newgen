import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const perPage = 30

// Parity with original Keluar controller: Arsip Surat Keluar (tabel log_surat).
export default async function ArsipSuratKeluarPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const q = params.q?.trim() ?? ""

  const where = {
    deleted_at: null,
    ...(q ? { OR: [{ nama_surat: { contains: q } }, { no_surat: { contains: q } }, { tweb_penduduk: { nama: { contains: q } } }] } : {}),
  }

  const [surat, total] = await Promise.all([
    prisma.log_surat.findMany({
      where,
      orderBy: { tanggal: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        tweb_penduduk: { select: { id: true, nama: true, nik: true } },
        tweb_surat_format: { select: { nama: true } },
      },
    }),
    prisma.log_surat.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  return (
    <div>
      <ContentHeader title="Arsip Surat Keluar" subtitle="Layanan Surat" breadcrumb={[{ label: "Sekretariat" }, { label: "Arsip Surat Keluar" }]} />

      <Box title={`Arsip Surat (${total.toLocaleString("id-ID")})`} noPadding>
        <form className="p-3 flex gap-2 border-b border-[#f4f4f4]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nomor, jenis surat, atau nama penduduk..."
            className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs focus:border-lte-primary focus:outline-none"
          />
          <button type="submit" className="inline-flex items-center gap-1 rounded-[3px] border px-3 py-1.5 text-sm bg-lte-primary border-[#367fa9] text-white hover:bg-[#367fa9]">
            <i className="fa fa-search" /> Cari
          </button>
        </form>

        <LteTable
          head={
            <>
              <Th>Tanggal</Th>
              <Th>No. Surat</Th>
              <Th>Jenis Surat</Th>
              <Th>Penduduk</Th>
              <Th>NIK</Th>
              <Th>Keterangan</Th>
            </>
          }
        >
          {surat.map((s) => (
            <tr key={s.id}>
              <Td>{s.tanggal.toLocaleDateString("id-ID")}</Td>
              <Td className="font-mono">{s.no_surat ?? "-"}</Td>
              <Td>{s.tweb_surat_format?.nama ?? s.nama_surat ?? "-"}</Td>
              <Td>
                {s.tweb_penduduk ? (
                  <Link href={`/penduduk/${s.tweb_penduduk.id}`} className="text-lte-primary hover:underline">{s.tweb_penduduk.nama}</Link>
                ) : (s.nama_non_warga ?? s.pemohon ?? "-")}
              </Td>
              <Td className="font-mono">{s.tweb_penduduk?.nik ?? (s.nik_non_warga?.toString() ?? "-")}</Td>
              <Td className="max-w-56 truncate">{s.keterangan ?? "-"}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <Paging base="/keluar" page={page} pages={pages} q={q} />
    </div>
  )
}
