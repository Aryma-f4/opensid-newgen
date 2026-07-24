# OpenSID → Next.js Migration Tracker

Aturan porting:
- **Route parity**: URL Next.js = URL CodeIgniter asli (`/{controller}` di root, tanpa prefix `/admin`).
- **Fitur parity**: perilaku mengikuti controller PHP asli di `../donjo-app/controllers/`.
- **Palet warna**: AdminLTE 2 skin dari setting DB `warna_tema_admin` (default `skin-purple`). Tombol memakai palet bootstrap AdminLTE.
- Modul yang belum diporting jatuh ke stub catch-all `src/app/(admin)/[...mod]/page.tsx`.

Status: ✅ selesai · 🟡 sebagian · ⬜ stub (belum) · ➖ tidak relevan di Next.js

## Ringkasan

| Metrik | Value |
|--------|-------|
| Admin pages | **136** ✅ |
| API routes | **167** ✅ |
| Prisma models | **262** ✅ (195 original + 67 added) |
| Auth | ✅ login (password) |
| Build | ✅ clean, no errors |
| Responsive | ✅ mobile hamburger + overlay (admin & public) |

## Inti / Auth

| Controller | Route asli | Next.js | Status |
|---|---|---|---|
| auth/* (siteman) | /siteman | `src/app/(auth)/siteman` | ✅ login password |
| Keluar (Arsip Surat Keluar) | /keluar | `src/app/(admin)/keluar` | ✅ |
| Logout | /siteman/logout | `src/app/(auth)/siteman/logout` | ✅ |
| Main | /main | `src/app/(admin)/main` | ✅ redirect /beranda |
| Beranda | /beranda | `src/app/(admin)/beranda` | ✅ dashboard |
| First | / (situs publik) | `src/app/(public)` | ✅ |

## Kependudukan

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Penduduk | /penduduk | `src/app/(admin)/penduduk` | ✅ CRUD + detail |
| Keluarga | /keluarga | `src/app/(admin)/keluarga` | ✅ |
| AnggotaKeluarga | /anggotakeluarga | `src/app/(admin)/anggota_keluarga` | ✅ |
| Rtm | /rtm | `src/app/(admin)/rtm` | ✅ |
| Penduduk_log | /penduduk_log | `src/app/(admin)/penduduk_log` | ✅ |
| Wilayah | /wilayah | `src/app/(admin)/wilayah` | ✅ |
| Suplemen | /suplemen | `src/app/(admin)/suplemen` | ✅ |
| Kelompok | /kelompok | `src/app/(admin)/kelompok` | ✅ |
| Lembaga | /lembaga | `src/app/(admin)/lembaga` | ✅ |
| Dpt | /dpt | `src/app/(admin)/dpt` | ✅ |
| Dtks | /dtks | `src/app/(admin)/dtks` | ✅ |
| Program_bantuan | /program_bantuan | `src/app/(admin)/program_bantuan` | ✅ |
| Peserta_bantuan | /peserta_bantuan | `src/app/(admin)/peserta_bantuan` | ✅ |
| Rentang_umur | /rentang_umur | `src/app/(admin)/rentang_umur` | ✅ |
| Pemilihan | /pemilihan | `src/app/(admin)/pemilihan` | ✅ |
| Stunting | /stunting | `src/app/(admin)/stunting` | ✅ |
| Covid19 | /covid19 | `src/app/(admin)/covid19` | ✅ |
| Periksa data | /periksa | `src/app/(admin)/[...mod]` | ⬜ stub |

## Statistik & Laporan

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Statistik | /statistik | `src/app/(admin)/statistik` | ✅ |
| Laporan | /laporan | `src/app/(admin)/laporan` | ✅ |
| Laporan_apbdes | /laporan_apbdes | `src/app/(admin)/laporan` | 🟡 tergabung |

## Sekretariat & Surat

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Surat_master | /surat_master | `src/app/(admin)/surat_master` | ✅ |
| Surat | /surat | - | ⬜ (generasi surat) |
| Surat Keluar | /surat_keluar | `src/app/(admin)/surat_keluar` | ✅ |
| Surat Masuk | /surat_masuk | `src/app/(admin)/surat_masuk` | ✅ |
| Surat Dinas | /surat_dinas | `src/app/(admin)/surat_dinas` | ✅ |
| Klasifikasi | /klasifikasi | `src/app/(admin)/klasifikasi` | ✅ |
| Permohonan_surat_admin | /permohonan_surat_admin | `src/app/(admin)/permohonan_surat_admin` | ✅ |
| Mailbox | /mailbox | `src/app/(admin)/mailbox` | ✅ |
| Dokumen | /dokumen | `src/app/(admin)/dokumen` | ✅ |
| Pendapat | /pendapat | `src/app/(admin)/pendapat` | ✅ |
| Lampiran | /lampiran | `src/app/(admin)/lampiran` | ✅ |
| Buku Umum | /buku_umum | `src/app/(admin)/buku_umum` | ✅ |
| Bumindes | /bumindes_* | - | ⬜ |

## Keuangan & Aset

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Keuangan | /keuangan_laporan | `src/app/(admin)/keuangan_laporan` | ✅ |
| Keuangan Manual | /keuangan_manual | `src/app/(admin)/keuangan_manual` | ✅ |
| Inventaris Asset | /inventaris_asset | `src/app/(admin)/inventaris_asset` | ✅ |
| Inventaris Gedung | /inventaris_gedung | `src/app/(admin)/inventaris_gedung` | ✅ |
| Inventaris Jalan | /inventaris_jalan | `src/app/(admin)/inventaris_jalan` | ✅ |
| Inventaris Peralatan | /inventaris_peralatan | `src/app/(admin)/inventaris_peralatan` | ✅ |
| Inventaris Tanah | /inventaris_tanah | `src/app/(admin)/inventaris_tanah` | ✅ |
| CDesa | /cdesa | `src/app/(admin)/cdesa` | ✅ |
| Data Persil | /data_persil | `src/app/(admin)/data_persil` | ✅ |
| Admin Pembangunan | /admin_pembangunan | `src/app/(admin)/admin_pembangunan` | ✅ |

## Peta (GIS)

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Area | /area | `src/app/(admin)/area` | ✅ |
| Garis | /garis | `src/app/(admin)/garis` | ✅ |
| Point | /point | `src/app/(admin)/point` | ✅ |
| Polygon | /polygon | `src/app/(admin)/polygon` | ✅ |

## Website Publik (admin)

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Web (artikel) | /web | `src/app/(admin)/web` | ✅ |
| Kategori | /kategori | `src/app/(admin)/kategori` | ✅ |
| Menu | /menu | `src/app/(admin)/menu` | ✅ |
| Gallery | /gallery | `src/app/(admin)/gallery` | ✅ |
| Komentar | /komentar | `src/app/(admin)/komentar` | ✅ |
| Teks Berjalan | /teks_berjalan | `src/app/(admin)/teks_berjalan` | ✅ |
| Sosmed | /sosmed | `src/app/(admin)/sosmed` | ✅ |
| Slider | /slider | `src/app/(admin)/slider` | ✅ |
| Dokumen Web | /dokumen_web | `src/app/(admin)/dokumen_web` | ✅ |
| Pengunjung | /pengunjung | `src/app/(admin)/pengunjung` | ✅ |
| Theme | /theme | `src/app/(admin)/theme` | ✅ |
| Pengaduan Admin | /pengaduan_admin | `src/app/(admin)/pengaduan_admin` | ✅ |
| Sinergi Program | /sinergi_program | `src/app/(admin)/sinergi_program` | ✅ |
| Web Widget | /web_widget | `src/app/(admin)/web_widget` | ✅ |

## Pengguna & Pengaturan

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Man_user | /man_user | `src/app/(admin)/man_user` | ✅ |
| Grup (akses) | /grup | `src/app/(admin)/grup` | ✅ |
| Pengguna (profil) | /pengguna | `src/app/(admin)/pengguna` | ✅ |
| Setting | /setting | `src/app/(admin)/setting` | ✅ |
| Identitas Desa | /identitas_desa | `src/app/(admin)/identitas_desa` | ✅ |
| Modul | /modul | `src/app/(admin)/[...mod]` | ⬜ |

## Layanan Mandiri & Komunikasi

| Controller | Route | Next.js | Status |
|---|---|---|---|
| Mandiri | /mandiri | `src/app/(admin)/mandiri` | ✅ |
| SMS | /sms | `src/app/(admin)/sms` | ✅ |
| Kontak | /kontak | `src/app/(admin)/kontak` | ✅ |
| Grup Kontak | /grup_kontak | `src/app/(admin)/grup_kontak` | ✅ |
| Notifikasi | /notifikasi | `src/app/(admin)/notifikasi` | ✅ |

## HMVC Modules

| Module | Route | Status |
|---|---|---|
| Anjungan | /anjungan | ✅ |
| BukuTamu | /buku_tamu | ✅ |
| Kehadiran | /kehadiran | ✅ |
| Lapak | /lapak | ✅ |
| Analisis | /analisis | ⬜ |
| Pelanggan | (layanan.opendesa) | ➖ |

## Internal (skip)

Api_*, Artisan, Dev, Job, Install*, Koneksi_database, MultiDB, PlaywrightController, Plugin, Qr_code, Securimage, ServeFileController, Sinkronisasi, external_api, internal_api, fweb, OpenSIDController → ➖ ditangani kembali via tooling Next.js.

## Database Schema (Prisma)

| Metrik | Value |
|--------|-------|
| Total Prisma models | 262 |
| Original OpenSID tables | 243 (create table migrations) |
| Missing from Prisma | 0 (all DB tables mapped) |
| Unsupported types | 7 (ENUM/SET — listed below) |
| Additional tables (not in migration files, added by OpenSID patches) | ~19 |

**Unsupported type fields** (ENUM/SET — queried via `any` cast):
`log_surat_dinas.derajat`, `pembangunan.satuan_waktu`, `pengaduan.status`, `persil.is_publik`, `suplemen.status`, `suplemen.form_isian`, `suplemen_terdata.data_form_isian`

**Plan** module: PHP controller exists but database table doesn't have a `plan` model in the connected MySQL instance — page not created.
