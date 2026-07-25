import { requireAdminAccess } from "@/lib/adminAccess"
import {
  anjunganCategoryWhere,
  ANJUNGAN_SETTING_KEYS,
  parseStoredAnjunganArticleIds,
  type AnjunganSettingKey,
  type AnjunganSettingUpdates,
} from "@/lib/anjunganConfig"
import { prisma } from "@/lib/prisma"

import AnjunganPengaturanManager, {
  type AnjunganArticleCategory,
  type AnjunganGalleryAlbum,
} from "./AnjunganPengaturanManager"

export const dynamic = "force-dynamic"

const moduleUrl = "anjungan_pengaturan"

const settingDefaults: AnjunganSettingUpdates = {
  sebutan_anjungan_mandiri: "",
  anjungan_artikel: "[]",
  anjungan_teks_berjalan: "",
  anjungan_profil: "3",
  anjungan_slide: "",
  anjungan_video: "",
  anjungan_youtube: "",
  tampilan_anjungan: "0",
  tampilan_anjungan_waktu: "30",
  tampilan_anjungan_slider: "",
  tampilan_anjungan_video: "",
  warna_anjungan: "nature",
  pencahayaan_anjungan: "light",
}

export default async function AnjunganPengaturanPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, categoryRecords, galleryRecords, canUpdate] = await Promise.all([
    prisma.setting_aplikasi.findMany({
      where: {
        config_id: actor.configId,
        key: { in: [...ANJUNGAN_SETTING_KEYS] },
      },
      select: { key: true, value: true },
    }),
    prisma.kategori.findMany({
      where: anjunganCategoryWhere(actor.configId),
      orderBy: [{ urut: "asc" }, { kategori: "asc" }],
      select: { id: true, kategori: true },
    }),
    prisma.gambar_gallery.findMany({
      where: {
        config_id: actor.configId,
        parrent: 0,
        enabled: 1,
      },
      orderBy: [{ urut: "asc" }, { nama: "asc" }],
      select: { id: true, nama: true },
    }),
    requireAdminAccess(moduleUrl, "u").then(() => true, () => false),
  ])

  const settings: AnjunganSettingUpdates = { ...settingDefaults }
  const presentKeys = new Set<AnjunganSettingKey>()
  for (const record of records) {
    if (!record.key || !ANJUNGAN_SETTING_KEYS.includes(record.key as AnjunganSettingKey)) continue
    const key = record.key as AnjunganSettingKey
    presentKeys.add(key)
    settings[key] = record.value ?? ""
  }

  const missingKeys = ANJUNGAN_SETTING_KEYS.filter((key) => !presentKeys.has(key))
  const categories: AnjunganArticleCategory[] = categoryRecords
  const galleries: AnjunganGalleryAlbum[] = galleryRecords

  return (
    <AnjunganPengaturanManager
      settings={settings}
      selectedArticleIds={parseStoredAnjunganArticleIds(settings.anjungan_artikel)}
      categories={categories}
      galleries={galleries}
      missingKeys={missingKeys}
      canUpdate={canUpdate}
    />
  )
}
