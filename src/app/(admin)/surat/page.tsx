import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader, Box, SmallBox, LteTable, Th, Td } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default async function SuratDashboard() {
  const [totalKonsep, totalCetak, totalFormat, recentLetters] = await Promise.all([
    prisma.log_surat.count({ where: { config_id: 1, status: 0 } }),
    prisma.log_surat.count({ where: { config_id: 1, status: { gte: 1 } } }),
    prisma.tweb_surat_format.count({ where: { config_id: 1 } }),
    prisma.log_surat.findMany({
      where: { config_id: 1 },
      orderBy: { tanggal: "desc" },
      take: 5,
      include: {
        tweb_surat_format: { select: { nama: true, url_surat: true } },
        tweb_penduduk: { select: { id: true, nik: true, nama: true } },
      },
    }),
  ])

  return (
    <div>
      <ContentHeader
        title="Surat"
        subtitle="Manajemen Surat Desa"
        breadcrumb={[{ label: "Sekretariat" }, { label: "Surat" }]}
      />

      {/* Quick Stats */}
      <div className="row">
        <SmallBox value={totalFormat} label="Format Surat" icon="fa-file-text-o" color="aqua" href="/surat/pilih" />
        <SmallBox value={totalKonsep} label="Konsep Surat" icon="fa-pencil-square-o" color="yellow" href="/surat/konsep" />
        <SmallBox value={totalCetak} label="Riwayat Surat" icon="fa-print" color="green" href="/surat/riwayat" />
        <SmallBox value="+" label="Buat Surat Baru" icon="fa-plus-circle" color="red" href="/surat/pilih" />
      </div>

      {/* Quick Actions */}
      <Box title="Aksi Cepat" color="success">
        <div className="flex flex-wrap gap-2">
          <Link href="/surat/pilih" className="btn btn-primary btn-sm">
            <i className="fa fa-plus-circle" /> Buat Surat Baru
          </Link>
          <Link href="/surat/konsep" className="btn btn-warning btn-sm">
            <i className="fa fa-pencil-square-o" /> Konsep Surat
            {totalKonsep > 0 && <span className="badge ml-1">{totalKonsep}</span>}
          </Link>
          <Link href="/surat/riwayat" className="btn btn-success btn-sm">
            <i className="fa fa-history" /> Riwayat Surat
          </Link>
        </div>
      </Box>

      {/* Recent Letters */}
      <Box title="Surat Terbaru" noPadding>
        <LteTable head={<><Th>Tanggal</Th><Th>Jenis Surat</Th><Th>Pemohon</Th><Th>Aksi</Th></>}>
          {recentLetters.length === 0 ? (
            <tr><Td colSpan={4} className="text-center py-8 text-gray-400">Belum ada surat</Td></tr>
          ) : (
            recentLetters.map((log) => (
              <tr key={log.id}>
                <Td>{log.tanggal?.toLocaleDateString("id-ID") ?? "-"}</Td>
                <Td>{log.nama_surat || log.tweb_surat_format?.nama || "-"}</Td>
                <Td>{log.pemohon || log.tweb_penduduk?.nama || "-"}</Td>
                <Td className="whitespace-nowrap">
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

      {/* Format Management Section */}
      <div className="mt-4">
        <Manager />
      </div>
    </div>
  )
}
