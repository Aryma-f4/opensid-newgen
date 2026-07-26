import type { ReactNode } from "react"
import type { PublicRouteKey } from "@/lib/themePuck"

// Typed context passed from each public route to Puck blocks
export type PublicThemeContext = {
  routeKey: PublicRouteKey
  config: {
    nama_desa?: string | null
    nama_kecamatan?: string | null
    nama_kabupaten?: string | null
    alamat_kantor?: string | null
    logo?: string | null
    telepon?: string | null
    email_desa?: string | null
    kode_pos?: string | null
  }
  articles?: {
    id: number
    judul: string
    slug?: string | null
    isi?: string | null
    gambar?: string | null
    tgl_upload: Date | null
  }[]
  article?: {
    id: number
    judul: string
    slug?: string | null
    isi: string | null
    gambar?: string | null
    tgl_upload: Date | null
  } | null
  categories?: {
    id: number
    kategori: string
    slug?: string
    count?: number
  }[]
  statistics?: {
    totalPenduduk: number
    totalKeluarga: number
    lakiLaki: number
    perempuan: number
  }
  apparatus?: {
    pamong_nama?: string | null
    pamong_nip?: string | null
    jabatan?: string | null
    foto?: string | null
  }[]
  socialMedia?: { nama?: string; link?: string }[]
  runningText?: { teks: string }[]
  menu?: any[]
}

// Dummy context for editor preview (no real data)
export function editorPreviewContext(routeKey: PublicRouteKey): PublicThemeContext {
  return {
    routeKey,
    config: { nama_desa: "Contoh Desa" },
    statistics: { totalPenduduk: 1200, totalKeluarga: 400, lakiLaki: 600, perempuan: 600 },
    apparatus: [
      { pamong_nama: "Kepala Desa", jabatan: "Kades" },
      { pamong_nama: "Sekretaris", jabatan: "Sekdes" },
    ],
  }
}
