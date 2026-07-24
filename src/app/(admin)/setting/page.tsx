import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import SettingManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function PengaturanPage() {
  const [config, settings] = await Promise.all([
    prisma.config.findFirst({ where: { app_key: "default" } }),
    prisma.setting_aplikasi.findMany({ orderBy: { urut: "asc" } }),
  ])

  return (
    <div>
      <ContentHeader title="Pengaturan" breadcrumb={[{ label: "Pengaturan" }]} />

      {config && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-bold mb-4">Identitas Desa</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Nama Desa</dt><dd className="font-medium">{config.nama_desa}</dd></div>
            <div><dt className="text-gray-500">Kode Desa</dt><dd className="font-medium">{config.kode_desa}</dd></div>
            <div><dt className="text-gray-500">Kecamatan</dt><dd className="font-medium">{config.nama_kecamatan}</dd></div>
            <div><dt className="text-gray-500">Kabupaten</dt><dd className="font-medium">{config.nama_kabupaten}</dd></div>
            <div><dt className="text-gray-500">Provinsi</dt><dd className="font-medium">{config.nama_propinsi}</dd></div>
            <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{config.email_desa}</dd></div>
            <div><dt className="text-gray-500">Telepon</dt><dd className="font-medium">{config.telepon}</dd></div>
            <div><dt className="text-gray-500">Alamat</dt><dd className="font-medium">{config.alamat_kantor}</dd></div>
            <div><dt className="text-gray-500">Kode Pos</dt><dd className="font-medium">{config.kode_pos}</dd></div>
          </dl>
        </div>
      )}

      <SettingManager settings={settings} />
    </div>
  )
}
