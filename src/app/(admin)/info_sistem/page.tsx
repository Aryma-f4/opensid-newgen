import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"

export default async function InfoSistemPage() {
  const [config, settings, settingCount] = await Promise.all([
    prisma.config.findFirst({ orderBy: { id: "asc" } }),
    prisma.setting_aplikasi.findMany({ orderBy: { id: "desc" }, take: 50 }),
    prisma.setting_aplikasi.count(),
  ])

  return (
    <div>
      <ContentHeader title="Info Sistem" breadcrumb={[{ label: "Pengaturan" }, { label: "Info Sistem" }]} />
      <Manager
        config={
          config
            ? {
                nama_desa: config.nama_desa,
                nama_kecamatan: config.nama_kecamatan,
                nama_kabupaten: config.nama_kabupaten,
                nama_propinsi: config.nama_propinsi,
                email_desa: config.email_desa,
                telepon: config.telepon,
                alamat_kantor: config.alamat_kantor,
                kode_pos: config.kode_pos != null ? String(config.kode_pos) : null,
              }
            : null
        }
        settings={settings.map((s) => ({
          id: s.id,
          key: s.key,
          value: s.value,
          kategori: s.kategori,
        }))}
        settingCount={settingCount}
      />
    </div>
  )
}
