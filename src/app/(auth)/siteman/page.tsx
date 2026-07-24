import { prisma } from "@/lib/prisma"
import LoginForm from "./LoginForm"

export const dynamic = "force-dynamic"

// Parity with original halaman /siteman: latar gambar penuh, kotak form di tengah
// dengan logo + identitas desa (lihat resources/views/admin/auth/index.blade.php).
export default async function SitemanPage() {
  const config = await prisma.config.findFirst({ where: { app_key: { not: "" } } }).catch(() => null)

  return (
    <div
      className="min-h-screen bg-[#337ab7] bg-cover bg-center bg-fixed flex items-center justify-center py-10"
      style={{ backgroundImage: "url('/assets/images/latar_login.jpg')" }}
    >
      <div className="w-full max-w-sm px-4">
        <div className="text-center text-white mb-6 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          {config?.logo && (
            <img src={`/storage/desa/logo/${config.logo}`} alt={config?.nama_desa ?? ""} className="w-[100px] mx-auto mb-3" />
          )}
          <h1 className="text-2xl font-semibold">Desa {config?.nama_desa ?? ""}</h1>
          <p className="text-sm mt-2 leading-relaxed opacity-90">
            {config?.alamat_kantor}
            {config?.kode_pos ? <><br />Kodepos {config.kode_pos}</> : null}
            {config?.nama_kecamatan ? <><br />Kecamatan {config.nama_kecamatan}</> : null}
            {config?.nama_kabupaten ? <><br />Kabupaten {config.nama_kabupaten}</> : null}
          </p>
        </div>
        <div className="bg-black/30 rounded-md p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
