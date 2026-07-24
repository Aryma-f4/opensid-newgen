import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader, Box, LteTable, Th, Td, Btn, Paging } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const statusLabel: Record<number, { label: string; className: string }> = {
  0: { label: "Konsep", className: "label label-warning" },
  1: { label: "Cetak", className: "label label-success" },
  2: { label: "Approve", className: "label label-primary" },
}

const perPage = 20

export default async function RiwayatSuratPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string; tgl_from?: string; tgl_to?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const q = params.q?.trim() ?? ""
  const statusFilter = params.status ? parseInt(params.status) : undefined
  const tglFrom = params.tgl_from?.trim() ?? ""
  const tglTo = params.tgl_to?.trim() ?? ""

  const where: any = { config_id: 1 }
  if (statusFilter !== undefined) where.status = statusFilter
  if (q) {
    where.OR = [
      { no_surat: { contains: q } },
      { nama_surat: { contains: q } },
      { pemohon: { contains: q } },
    ]
  }
  if (tglFrom) where.tanggal = { ...(where.tanggal || {}), gte: new Date(tglFrom) }
  if (tglTo) where.tanggal = { ...(where.tanggal || {}), lte: new Date(tglTo + "T23:59:59") }

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
        title="Riwayat Surat"
        subtitle={`${total} surat`}
        breadcrumb={[{ label: "Surat", href: "/surat" }, { label: "Riwayat Surat" }]}
      />

      <Box title={`Riwayat Surat (${total})`} noPadding>
        <div className="p-3 border-b border-[#f4f4f4]">
          <form className="flex flex-wrap gap-2 items-end" method="GET" action="">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nomor/jenis/pemohon..."
              className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs"
            />
            <select name="status" defaultValue={statusFilter ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Status</option>
              <option value="0">Konsep</option>
              <option value="1">Cetak</option>
              <option value="2">Approve</option>
            </select>
            <input name="tgl_from" type="date" defaultValue={tglFrom} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
            <input name="tgl_to" type="date" defaultValue={tglTo} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm" />
            <Btn type="submit" color="primary"><i className="fa fa-search" /> Cari</Btn>
            {(q || statusFilter !== undefined || tglFrom || tglTo) && (
              <Link href="/surat/riwayat" className="btn btn-default btn-sm">Reset</Link>
            )}
          </form>
        </div>

        <LteTable head={<><Th>Tanggal</Th><Th>Jenis Surat</Th><Th>Pemohon</Th><Th>No. Surat</Th><Th>Status</Th><Th>Aksi</Th></>}>
          {data.length === 0 ? (
            <tr><Td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada riwayat surat</Td></tr>
          ) : (
            data.map((log) => {
              const st = statusLabel[log.status ?? 0] ?? { label: "Unknown", className: "label label-default" }
              return (
                <tr key={log.id}>
                  <Td>{log.tanggal?.toLocaleDateString("id-ID") ?? "-"}</Td>
                  <Td>{log.nama_surat || log.tweb_surat_format?.nama || "-"}</Td>
                  <Td>{log.pemohon || log.tweb_penduduk?.nama || "-"}</Td>
                  <Td className="font-mono">{log.no_surat ?? "-"}</Td>
                  <Td><span className={st.className}>{st.label}</span></Td>
                  <Td className="whitespace-nowrap">
                    {(log.status ?? 0) === 0 && (
                      <Link
                        href={`/surat/buat/${log.id_format_surat}?draft=${log.id}`}
                        className="btn btn-primary btn-xs"
                      >
                        <i className="fa fa-pencil" /> Edit
                      </Link>
                    )}
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
              )
            })
          )}
        </LteTable>
      </Box>

      <Paging base="/surat/riwayat" page={page} pages={pages} q={q} extraParams={{ status: statusFilter !== undefined ? String(statusFilter) : undefined, tgl_from: tglFrom, tgl_to: tglTo } as any} />

      <div className="mt-3">
        <Link href="/surat" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali
        </Link>
      </div>
    </div>
  )
}
