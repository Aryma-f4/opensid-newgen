import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, SmallBox } from "@/components/admin/Ui"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AnalisisDashboard() {
  const [totalMaster, totalIndikator, totalKategori, totalPeriode, totalParameter, totalKlasifikasi, activePeriods] = await Promise.all([
    prisma.analisis_master.count(),
    prisma.analisis_indikator.count(),
    prisma.analisis_kategori_indikator.count(),
    prisma.analisis_periode.count(),
    prisma.analisis_parameter.count(),
    prisma.analisis_klasifikasi.count(),
    prisma.analisis_periode.count({ where: { aktif: true } }),
  ])

  // Count total respondents using raw SQL (analisis_respon is @ignore)
  const totalResponSql = `SELECT COUNT(DISTINCT CONCAT(id_subjek, '-', id_periode)) as total FROM analisis_respon`
  const totalResponResult: any = await prisma.$queryRawUnsafe(totalResponSql)
  const totalResponden = Number(totalResponResult[0]?.total ?? 0)

  const subModules = [
    { href: "/analisis/master", label: "Master", icon: "fa-pie-chart", desc: "Kelola survey" },
    { href: "/analisis/kategori_indikator", label: "Kategori", icon: "fa-tags", desc: "Kategori indikator" },
    { href: "/analisis/indikator", label: "Indikator", icon: "fa-question-circle", desc: "Pertanyaan survey" },
    { href: "/analisis/parameter", label: "Parameter", icon: "fa-list-ul", desc: "Opsi jawaban" },
    { href: "/analisis/klasifikasi", label: "Klasifikasi", icon: "fa-filter", desc: "Klasifikasi responden" },
    { href: "/analisis/periode", label: "Periode", icon: "fa-calendar", desc: "Periode survey" },
    { href: "/analisis/responden", label: "Responden", icon: "fa-users", desc: "Data responden" },
    { href: "/analisis/laporan", label: "Laporan", icon: "fa-file-text-o", desc: "Laporan hasil survey" },
    { href: "/analisis/statistik", label: "Statistik", icon: "fa-bar-chart", desc: "Statistik jawaban" },
  ]

  return (
    <div>
      <ContentHeader title="Analisis / Survey" breadcrumb={[{ label: "Analisis" }]} />

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <SmallBox value={totalMaster} label="Total Survey" icon="fa-pie-chart" color="aqua" href="/analisis/master" />
        <SmallBox value={totalIndikator} label="Total Indikator" icon="fa-question-circle" color="green" />
        <SmallBox value={activePeriods} label="Periode Aktif" icon="fa-calendar-check-o" color="yellow" />
        <SmallBox value={totalResponden} label="Total Responden" icon="fa-users" color="red" />
      </div>

      {/* Sub-menu navigation */}
      <Box title="Menu Analisis">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {subModules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50 hover:border-lte-primary transition-colors"
            >
              <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                <i className={`fa ${m.icon} text-lg`} />
              </div>
              <div>
                <div className="font-semibold text-sm">{m.label}</div>
                <div className="text-xs text-gray-500">{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </Box>

      {/* Additional Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mt-4">
        <Box title="Data Master">
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt>Kategori Indikator</dt><dd className="font-bold">{totalKategori}</dd></div>
            <div className="flex justify-between"><dt>Parameter (Opsi Jawaban)</dt><dd className="font-bold">{totalParameter}</dd></div>
            <div className="flex justify-between"><dt>Klasifikasi</dt><dd className="font-bold">{totalKlasifikasi}</dd></div>
            <div className="flex justify-between"><dt>Total Periode</dt><dd className="font-bold">{totalPeriode}</dd></div>
          </dl>
        </Box>

        <Box title="Referensi">
          <p className="text-sm text-gray-600">
            Modul Analisis digunakan untuk membuat survey, mengumpulkan jawaban dari responden (penduduk/keluarga),
            dan menghasilkan laporan statistik.
          </p>
        </Box>

        <Box title="Cara Penggunaan">
          <ol className="text-sm text-gray-600 list-decimal ml-4 space-y-1">
            <li>Buat <Link href="/analisis/master" className="text-lte-primary">Master Survey</Link></li>
            <li>Buat <Link href="/analisis/kategori_indikator" className="text-lte-primary">Kategori</Link></li>
            <li>Buat <Link href="/analisis/indikator" className="text-lte-primary">Indikator</Link></li>
            <li>Buat <Link href="/analisis/parameter" className="text-lte-primary">Parameter</Link> (opsi jawaban)</li>
            <li>Buat <Link href="/analisis/periode" className="text-lte-primary">Periode</Link></li>
            <li>Responden mengisi survey</li>
            <li>Lihat <Link href="/analisis/laporan" className="text-lte-primary">Laporan</Link></li>
          </ol>
        </Box>
      </div>
    </div>
  )
}
