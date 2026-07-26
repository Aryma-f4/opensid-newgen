import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/login", destination: "/siteman", permanent: false },
      { source: "/logout", destination: "/siteman/logout", permanent: false },
      { source: "/admin", destination: "/beranda", permanent: false },
      // Analisis routes — CI uses underscore, Next.js uses slash
      { source: "/analisis_master/:path*", destination: "/analisis/master/:path*", permanent: false },
      { source: "/analisis_master", destination: "/analisis/master", permanent: false },
      { source: "/analisis_kategori_indikator/:path*", destination: "/analisis/kategori_indikator/:path*", permanent: false },
      { source: "/analisis_kategori_indikator", destination: "/analisis/kategori_indikator", permanent: false },
      { source: "/analisis_indikator/:path*", destination: "/analisis/indikator/:path*", permanent: false },
      { source: "/analisis_indikator", destination: "/analisis/indikator", permanent: false },
      { source: "/analisis_parameter/:path*", destination: "/analisis/parameter/:path*", permanent: false },
      { source: "/analisis_parameter", destination: "/analisis/parameter", permanent: false },
      { source: "/analisis_klasifikasi/:path*", destination: "/analisis/klasifikasi/:path*", permanent: false },
      { source: "/analisis_klasifikasi", destination: "/analisis/klasifikasi", permanent: false },
      { source: "/analisis_periode/:path*", destination: "/analisis/periode/:path*", permanent: false },
      { source: "/analisis_periode", destination: "/analisis/periode", permanent: false },
      { source: "/analisis_laporan/:path*", destination: "/analisis/laporan/:path*", permanent: false },
      { source: "/analisis_laporan", destination: "/analisis/laporan", permanent: false },
      { source: "/analisis_statistik/:path*", destination: "/analisis/statistik/:path*", permanent: false },
      { source: "/analisis_statistik", destination: "/analisis/statistik", permanent: false },
      // Kehadiran routes
      { source: "/kehadiran/:path*", destination: "/kehadiran/:path*", permanent: false },
      // Laporan routes
      { source: "/laporan_keuangan/:path*", destination: "/laporan_keuangan/:path*", permanent: false },
      { source: "/laporan_keuangan", destination: "/laporan_keuangan", permanent: false },
      // Covid routes
      { source: "/covid19_pantau/:path*", destination: "/covid19/pantau/:path*", permanent: false },
      { source: "/covid19_pantau", destination: "/covid19/pantau", permanent: false },
    ]
  },
  async rewrites() {
    return [{ source: "/admin/:path*", destination: "/:path*" }]
  },
}

export default nextConfig
