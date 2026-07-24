const LEGACY_ROUTE_MAP: Record<string, string> = {
  "gis/clear": "/gis",
  "laporan_rentan/clear": "/laporan_rentan",
  "vaksin_covid/clear": "/vaksin_covid",
  kehadiran_jam_kerja: "/kehadiran/jam_kerja",
  kehadiran_hari_libur: "/kehadiran/hari_libur",
  kehadiran_rekapitulasi: "/kehadiran/rekapitulasi",
  kehadiran_pengaduan: "/kehadiran/pengaduan",
  kehadiran_pengajuan_izin_pamong: "/kehadiran/pengajuan_izin",
  kehadiran_pengajuan_izin: "/kehadiran/persetujuan_izin",
  kehadiran_keluar: "/kehadiran/alasan_keluar",
  "keuangan/laporan": "/laporan_keuangan",
  "mandiri/clear": "/mandiri",
  "lembaga/clear": "/lembaga",
  "komentar/clear": "/komentar",
  "kelompok/clear": "/kelompok",
  "gallery/clear": "/gallery",
  "program_bantuan/clear": "/program_bantuan",
  data_persil: "/data_persil",
  analisis_master: "/analisis/master",
  "menu/clear": "/menu"
}

export function mapRoute(url: string | null): string | null {
  if (!url) return null
  return LEGACY_ROUTE_MAP[url] ?? `/${url}`
}
