import Link from "next/link"

import { Box, ContentHeader } from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"

export const dynamic = "force-dynamic"

const moduleUrl = "bumindes_umum"

const reports = [
  {
    href: "/pengurus",
    icon: "fa-sitemap",
    title: "Pemerintah Desa",
    description: "Kelola data inti pamong, jabatan, dan status kehadiran.",
    available: true,
  },
  {
    href: "/bumindes_arsip",
    icon: "fa-archive",
    title: "Arsip Surat",
    description: "Belum dibuka dari hub ini sampai query dan mutasinya tenant-safe.",
    available: false,
  },
  {
    href: "/bumindes_inventaris_kekayaan",
    icon: "fa-cubes",
    title: "Inventaris dan Kekayaan",
    description: "Belum dibuka dari hub ini sampai query dan mutasinya tenant-safe.",
    available: false,
  },
  {
    href: "/inventaris_tanah",
    icon: "fa-map",
    title: "Inventaris Tanah",
    description: "Belum dibuka dari hub ini sampai query dan mutasinya tenant-safe.",
    available: false,
  },
  {
    href: "/inventaris_gedung",
    icon: "fa-building",
    title: "Inventaris Gedung",
    description: "Belum dibuka dari hub ini sampai query dan mutasinya tenant-safe.",
    available: false,
  },
  {
    href: "/inventaris_jalan",
    icon: "fa-road",
    title: "Inventaris Jalan",
    description: "Belum dibuka dari hub ini sampai query dan mutasinya tenant-safe.",
    available: false,
  },
  {
    href: "/inventaris_peralatan",
    icon: "fa-wrench",
    title: "Inventaris Peralatan",
    description: "Belum dibuka dari hub ini sampai query dan mutasinya tenant-safe.",
    available: false,
  },
] as const

export default async function BumindesUmumPage() {
  await requireAdminAccess(moduleUrl, "b")

  return (
    <div>
      <ContentHeader
        title="Administrasi Umum"
        subtitle="Pusat akses buku administrasi desa"
        breadcrumb={[{ label: "Buku Administrasi Desa" }, { label: "Administrasi Umum" }]}
      />

      <Box title="Buku Administrasi Umum">
        <p className="mb-4 text-sm text-gray-600">
          Pilih buku yang akan dikelola. Setiap halaman tetap menerapkan hak akses
          modulnya sendiri saat dibuka.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const content = (
              <>
              <div className="mb-2 flex items-center gap-3">
                <i className={`fa ${report.icon} text-xl text-sky-600`} aria-hidden="true" />
                <span className="font-semibold">{report.title}</span>
              </div>
              <p className="mb-0 text-sm text-gray-500">{report.description}</p>
              {!report.available && (
                <span className="mt-3 inline-block rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                  Ditahan untuk keamanan tenant
                </span>
              )}
              </>
            )

            return report.available ? (
              <Link
                key={report.href}
                href={report.href}
                className="rounded border border-gray-200 bg-white p-4 text-gray-700 shadow-sm transition hover:border-sky-500 hover:text-sky-700 hover:no-underline"
              >
                {content}
              </Link>
            ) : (
              <div
                key={report.href}
                className="rounded border border-gray-200 bg-gray-50 p-4 text-gray-500"
                aria-disabled="true"
              >
                {content}
              </div>
            )
          })}
        </div>
      </Box>
    </div>
  )
}
