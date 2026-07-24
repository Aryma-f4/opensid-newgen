# OpenSID NewGen

Next.js 16 rewrite of [OpenSID](https://github.com/OpenSID/OpenSID) — sistem informasi desa sumber terbuka.

Full feature parity with the original PHP CodeIgniter version, rebuilt with modern stack: **Next.js 16 + React 19 + TypeScript + Prisma + Tailwind CSS v4 + AdminLTE 2 skin**.

## Quick Start

```bash
# 1. Setup database (MySQL)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS opensid"

# 2. Import your existing OpenSID database or run migrations
#    (see docs for migration from existing OpenSID installation)

# 3. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and AUTH_SECRET

# 4. Install & generate
npm install
npx prisma generate

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Login at `/siteman` with your existing OpenSID admin credentials.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + AdminLTE 2 skin |
| ORM | Prisma 6 (MySQL) |
| Auth | NextAuth v5 (Credentials) |
| GIS | Leaflet.js |
| Charts/Export | Custom (XLSX, CSV, HTML print) |

## Project Structure

```
opensid-newgen/
├── prisma/
│   └── schema.prisma          # 262 models — full DB schema
├── src/
│   ├── app/
│   │   ├── (admin)/           # 151 admin pages (private)
│   │   ├── (auth)/            # Login/logout
│   │   ├── (public)/          # Public homepage + articles
│   │   └── api/               # 268 REST API routes
│   ├── components/
│   │   ├── admin/             # Shared admin components
│   │   │   ├── CrudManager.tsx   # Generic CRUD component
│   │   │   ├── DataTable.tsx     # Table with search/pagination
│   │   │   ├── FormModal.tsx     # Modal form wrapper
│   │   │   ├── ExportUtils.tsx   # Excel/CSV/print export
│   │   │   ├── MapView.tsx       # Leaflet GIS map
│   │   │   ├── Ui.tsx            # AdminLTE-style UI primitives
│   │   │   ├── Sidebar.tsx       # Admin sidebar
│   │   │   └── Topbar.tsx        # Admin topbar
│   │   └── public/            # Public site components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── crud.ts            # REST API factories
│   │   ├── actions.ts         # Server action factory
│   │   ├── validation.ts      # Zod schemas
│   │   ├── export.ts          # Server-side export utilities
│   │   ├── helpers.ts         # Data fetching helpers
│   │   └── adminMenu.ts       # Dynamic menu builder
│   └── generated/             # Prisma generated client
├── public/
│   ├── assets/               # AdminLTE CSS/fonts
│   └── storage/              # Uploaded files
├── FEATURE_CHECKLIST.md      # Feature parity tracking
└── MIGRATION.md              # Migration status tracker
```

## Feature Coverage

### All 161 PHP Controllers Ported

| Module Group | Count | Status |
|---|---|---|
| Inti / Auth | 7 | ✅ Login, Dashboard, Public home |
| Kependudukan | 30 | ✅ Penduduk CRUD, Keluarga, Wilayah, Dpt, Dtks, Stunting, dll. |
| Sekretariat & Surat | 15 | ✅ Surat Keluar/Masuk/Dinas, Klasifikasi, Mailbox |
| Bumindes | 13 | ✅ All 13 Buku Administrasi Desa |
| Statistik & Laporan | 8 | ✅ Lap. APBDes, Inventaris, Penduduk, Rentan |
| Keuangan & Aset | 22 | ✅ Inventaris, CDesa, Persil, Pembangunan |
| Website Publik | 17 | ✅ Artikel, Kategori, Menu, Gallery, Theme |
| Pengguna & Pengaturan | 14 | ✅ Man_user, Grup, Setting, Modul |
| Layanan & Komunikasi | 13 | ✅ SMS, Kontak, Notifikasi, Mandiri |
| GIS / Peta | 7 | ✅ Area, Garis, Point, Polygon, Map Viewer |
| **Analisis (HMVC)** | **10** | ✅ Survey/analysis module — Master, Kategori, Indikator, Parameter, Klasifikasi, Periode, Responden, Laporan, Statistik |
| **Surat System** | **6** | ✅ Letter generation wizard — Pilih, Buat, Konsep, Riwayat, Cetak |
| **Other HMVC** | 5 | ✅ Anjungan, BukuTamu, Kehadiran, Lapak, Pelanggan |

## Key Features

- **Full CRUD** on 121 modules (create/edit/delete via Server Actions + REST API)
- **Export**: CSV, Excel, Print on all 108 DataTable modules
- **Import**: Generic Excel/CSV import handler for all modules
- **Detail pages**: 16 modules with dedicated `[id]` detail views
- **Advanced filters**: Dusun, date range, status, year filters on 12+ modules
- **File upload**: Dokumen, Gallery, Slider with storage API
- **GIS Map Viewer**: Leaflet.js with GeoJSON area/garis/point layers
- **Surat System**: Letter template selection → penduduk search → form isian → HTML preview → print
- **Analisis Module**: Full survey/analysis with questions, parameters, responses, statistics
- **Responsive**: Mobile hamburger navigation with sidebar overlay (admin + public)
- **Dynamic Menu**: Admin menu reads from `setting_modul` DB table

## Admin Pages Structure

Every module follows the same pattern:

```
src/app/(admin)/{module}/
├── page.tsx          # Server component — fetches data, renders Manager
├── Manager.tsx       # Client component — UI with CrudManager or custom
├── actions.ts        # Server Actions — create/update/delete
└── [id]/
    └── page.tsx      # Detail page (optional)
```

API routes:

```
src/app/api/{module}/
├── route.ts          # Collection: GET (list), POST (create), DELETE (bulk)
└── [id]/
    └── route.ts      # Item: GET (one), PUT (update), DELETE
```

## AdminLTE 2 Skins

The admin interface supports the same skin system as original OpenSID:

- `skin-blue`, `skin-purple`, `skin-green`, `skin-red`, `skin-yellow`, `skin-black`
- Light variants: `skin-blue-light`, etc.
- Active skin stored in DB: `setting_aplikasi` where `key = 'warna_tema_admin'`
- Default: `skin-purple`

## Migration from OpenSID

To migrate from an existing OpenSID MySQL database:

```bash
# 1. Point to your existing database
DATABASE_URL="mysql://user:pass@localhost:3306/opensid"

# 2. Introspect the schema
npx prisma db pull

# 3. Generate Prisma client
npx prisma generate

# 4. Run the app
npm run dev
```

Your existing admin credentials (from `user` table) will work with the NextAuth credentials login.

## Environment Variables

```env
DATABASE_URL="mysql://root@localhost:3306/opensid"
AUTH_SECRET="your-secret-here"         # Generate with: openssl rand -base64 32
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"
```

## API Routes

268 REST API endpoints follow RESTful conventions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/{module}` | List with pagination (`?page=1&perPage=20&q=search`) |
| `POST` | `/api/{module}` | Create |
| `DELETE` | `/api/{module}` | Bulk delete (`{ ids: [...] }`) |
| `GET` | `/api/{module}/[id]` | Get one |
| `PUT` | `/api/{module}/[id]` | Update |
| `DELETE` | `/api/{module}/[id]` | Delete one |
| `GET` | `/api/penduduk/search?q=` | Penduduk search (for surat) |
| `GET` | `/api/gis` | GeoJSON for map viewer |
| `POST` | `/api/import` | Generic CSV import |
| `POST` | `/api/upload` | File upload |
| `GET` | `/api/sitemap` | XML sitemap |
| `GET` | `/api/feed` | RSS feed |

## Contributing

This is a port of [OpenSID](https://github.com/OpenSID/OpenSID). The original project is licensed under GPL v3. All contributions follow the same license.

## License

GNU General Public License v3.0 — same as OpenSID.
