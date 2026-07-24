import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader, Box, LteTable, Th, Td, Btn, Paging } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const perPage = 20

export default async function KonsepSuratPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const q = params.q?.trim() ?? ""

  const where: any = {
    config_id: 1,
    status: 0, // Draft/konsep
  }
  if (q) {
    where.OR = [
      { no_surat: { contains: q } },
      { nama_surat: { contains: q } },
      { pemohon: { contains: q } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.log_surat.findMany({
      where,
      orderBy: { tanggal: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        tweb_surat_format: { select: { nama: true } },
        tweb_penduduk: { select: { id: true, nik: true, nama: true } },
      },
    }),
    prisma.log_surat.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  return (
    <div>
      <ContentHeader
        title="Konsep Surat"
        subtitle={`${total} draft`}
        breadcrumb={[{ label: "Surat", href: "/surat" }, { label: "Konsep Surat" }]}
      />

      <Box title={`Konsep Surat (${total})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4]">
          <form className="flex gap-2" method="GET" action="">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari..."
              className="w-full max-w-xs border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm"
            />
            <Btn type="submit" color="primary"><i className="fa fa-search" /> Cari</Btn>
            {q && <Link href="/surat/konsep" className="btn btn-default btn-sm">Reset</Link>}
          </form>
        </div>

        <LteTable head={<><Th>Tanggal</Th><Th>Jenis Surat</Th><Th>Pemohon</Th><Th>No. Surat</Th><Th>Aksi</Th></>}>
          {data.length === 0 ? (
            <tr><Td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada konsep surat</Td></tr>
          ) : (
            data.map((log) => (
              <tr key={log.id}>
                <Td>{log.tanggal?.toLocaleDateString("id-ID") ?? "-"}</Td>
                <Td>{log.nama_surat || log.tweb_surat_format?.nama || "-"}</Td>
                <Td>{log.pemohon || log.tweb_penduduk?.nama || "-"}</Td>
                <Td className="font-mono">{log.no_surat ?? "-"}</Td>
                <Td className="whitespace-nowrap">
                  <Link
                    href={`/surat/buat/${log.id_format_surat}?draft=${log.id}`}
                    className="btn btn-primary btn-xs"
                  >
                    <i className="fa fa-pencil" /> Lanjutkan
                  </Link>
                  {" "}
                  <Link
                    href={`/surat/cetak/${log.id}`}
                    target="_blank"
                    className="btn btn-success btn-xs"
                  >
                    <i className="fa fa-print" /> Cetak
                  </Link>
                </Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>

      <Paging base="/surat/konsep" page={page} pages={pages} q={q} />

      <div className="mt-3">
        <Link href="/surat" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali
        </Link>
      </div>
    </div>
  )
}
