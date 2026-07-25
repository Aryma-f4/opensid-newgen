"use client"

import { useState } from "react"

import { Box, Btn, ContentHeader } from "@/components/admin/Ui"
import type {
  AnjunganSettingKey,
  AnjunganSettingUpdates,
} from "@/lib/anjunganConfig"

import { updateAnjunganSettings } from "./actions"

export type AnjunganArticleCategory = {
  id: number
  kategori: string
}

export type AnjunganGalleryAlbum = {
  id: number
  nama: string
}

export default function AnjunganPengaturanManager({
  settings,
  selectedArticleIds,
  categories,
  galleries,
  missingKeys,
  canUpdate,
}: {
  settings: AnjunganSettingUpdates
  selectedArticleIds: number[]
  categories: AnjunganArticleCategory[]
  galleries: AnjunganGalleryAlbum[]
  missingKeys: AnjunganSettingKey[]
  canUpdate: boolean
}) {
  const [profile, setProfile] = useState(settings.anjungan_profil)
  const [screensaver, setScreensaver] = useState(settings.tampilan_anjungan)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const storageAvailable = missingKeys.length === 0

  async function submit(formData: FormData) {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const result = await updateAnjunganSettings(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSuccess("Pengaturan anjungan berhasil disimpan.")
    } catch {
      setError("Pengaturan anjungan gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Pengaturan Anjungan"
        subtitle="Konfigurasi tampilan lokal anjungan mandiri"
        breadcrumb={[{ label: "Anjungan" }, { label: "Pengaturan" }]}
      />

      <Box title="Konfigurasi Lokal">
        {!storageAvailable && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            Formulir dinonaktifkan karena penyimpanan tenant belum memiliki pengaturan:
            {" "}{missingKeys.join(", ")}.
          </div>
        )}
        {error && <p className="mb-4 text-sm text-red-700" role="alert">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-700" role="status">{success}</p>}

        <form action={submit}>
          <fieldset disabled={!canUpdate || !storageAvailable || saving} className="space-y-5">
            <div>
              <label htmlFor="sebutan_anjungan_mandiri" className="mb-1 block text-sm font-medium">
                Sebutan Anjungan
              </label>
              <input
                id="sebutan_anjungan_mandiri"
                name="sebutan_anjungan_mandiri"
                type="text"
                maxLength={100}
                defaultValue={settings.sebutan_anjungan_mandiri}
                className="form-control input-sm"
              />
            </div>

            <div>
              <label htmlFor="anjungan_artikel" className="mb-1 block text-sm font-medium">
                Kategori Artikel
              </label>
              <select
                id="anjungan_artikel"
                name="anjungan_artikel"
                multiple
                size={Math.min(Math.max(categories.length, 3), 8)}
                defaultValue={selectedArticleIds.map(String)}
                className="form-control input-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.kategori}</option>
                ))}
              </select>
              <p className="mb-0 mt-1 text-xs text-gray-500">
                Tahan Ctrl/Cmd untuk memilih lebih dari satu kategori.
              </p>
            </div>

            <div>
              <label htmlFor="anjungan_teks_berjalan" className="mb-1 block text-sm font-medium">
                Teks Berjalan
              </label>
              <input
                id="anjungan_teks_berjalan"
                name="anjungan_teks_berjalan"
                type="text"
                maxLength={500}
                defaultValue={settings.anjungan_teks_berjalan}
                className="form-control input-sm"
              />
            </div>

            <div className="border-t border-gray-200 pt-5">
              <h3 className="mb-3 mt-0 text-base font-bold">Profil Desa</h3>
              <div className="mb-4 max-w-sm">
                <label htmlFor="anjungan_profil" className="mb-1 block text-sm font-medium">
                  Tampilan Profil
                </label>
                <select
                  id="anjungan_profil"
                  name="anjungan_profil"
                  value={profile}
                  onChange={(event) => setProfile(event.target.value)}
                  className="form-control input-sm"
                >
                  <option value="1">Slider</option>
                  <option value="2">Video</option>
                  <option value="3">YouTube</option>
                </select>
              </div>

              {profile === "1" && (
                <div>
                  <label htmlFor="anjungan_slide" className="mb-1 block text-sm font-medium">
                    Galeri Gambar <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="anjungan_slide"
                    name="anjungan_slide"
                    defaultValue={settings.anjungan_slide}
                    required
                    className="form-control input-sm"
                  >
                    <option value="">-- Pilih Galeri --</option>
                    {galleries.map((gallery) => (
                      <option key={gallery.id} value={gallery.id}>{gallery.nama}</option>
                    ))}
                  </select>
                </div>
              )}
              {profile !== "1" && <input type="hidden" name="anjungan_slide" value={settings.anjungan_slide} />}

              {profile === "2" ? (
                <div>
                  <label htmlFor="anjungan_video" className="mb-1 block text-sm font-medium">
                    URL Video (.mp4) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="anjungan_video"
                    name="anjungan_video"
                    type="text"
                    maxLength={2048}
                    defaultValue={settings.anjungan_video}
                    required
                    className="form-control input-sm"
                  />
                </div>
              ) : (
                <input type="hidden" name="anjungan_video" value={settings.anjungan_video} />
              )}

              {profile === "3" ? (
                <div>
                  <label htmlFor="anjungan_youtube" className="mb-1 block text-sm font-medium">
                    ID atau URL YouTube <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="anjungan_youtube"
                    name="anjungan_youtube"
                    type="text"
                    maxLength={2048}
                    defaultValue={settings.anjungan_youtube}
                    required
                    className="form-control input-sm"
                  />
                </div>
              ) : (
                <input type="hidden" name="anjungan_youtube" value={settings.anjungan_youtube} />
              )}
            </div>

            <div className="border-t border-gray-200 pt-5">
              <h3 className="mb-3 mt-0 text-base font-bold">Screensaver</h3>
              <div className="mb-4 max-w-sm">
                <label htmlFor="tampilan_anjungan" className="mb-1 block text-sm font-medium">
                  Tampilan Screensaver
                </label>
                <select
                  id="tampilan_anjungan"
                  name="tampilan_anjungan"
                  value={screensaver}
                  onChange={(event) => setScreensaver(event.target.value)}
                  className="form-control input-sm"
                >
                  <option value="0">Tidak Aktif</option>
                  <option value="1">Slider</option>
                  <option value="2">Video</option>
                </select>
              </div>

              <div className="mb-4 max-w-sm">
                <label htmlFor="tampilan_anjungan_waktu" className="mb-1 block text-sm font-medium">
                  Waktu Muncul (detik)
                </label>
                <input
                  id="tampilan_anjungan_waktu"
                  name="tampilan_anjungan_waktu"
                  type="number"
                  min={1}
                  max={86400}
                  defaultValue={settings.tampilan_anjungan_waktu || "30"}
                  required
                  className="form-control input-sm"
                />
              </div>

              {screensaver === "1" ? (
                <div>
                  <label htmlFor="tampilan_anjungan_slider" className="mb-1 block text-sm font-medium">
                    Galeri Screensaver <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tampilan_anjungan_slider"
                    name="tampilan_anjungan_slider"
                    defaultValue={settings.tampilan_anjungan_slider}
                    required
                    className="form-control input-sm"
                  >
                    <option value="">-- Pilih Galeri --</option>
                    {galleries.map((gallery) => (
                      <option key={gallery.id} value={gallery.id}>{gallery.nama}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type="hidden" name="tampilan_anjungan_slider" value={settings.tampilan_anjungan_slider} />
              )}

              {screensaver === "2" ? (
                <div>
                  <label htmlFor="tampilan_anjungan_video" className="mb-1 block text-sm font-medium">
                    URL Video Screensaver (.mp4) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tampilan_anjungan_video"
                    name="tampilan_anjungan_video"
                    type="text"
                    maxLength={2048}
                    defaultValue={settings.tampilan_anjungan_video}
                    required
                    className="form-control input-sm"
                  />
                </div>
              ) : (
                <input type="hidden" name="tampilan_anjungan_video" value={settings.tampilan_anjungan_video} />
              )}
            </div>

            <div className="grid gap-4 border-t border-gray-200 pt-5 md:grid-cols-2">
              <div>
                <label htmlFor="warna_anjungan" className="mb-1 block text-sm font-medium">
                  Warna Anjungan
                </label>
                <select
                  id="warna_anjungan"
                  name="warna_anjungan"
                  defaultValue={settings.warna_anjungan}
                  className="form-control input-sm"
                >
                  <option value="nature">Biru &amp; Hijau</option>
                  <option value="travel">Ungu &amp; Pink</option>
                  <option value="casual">Tosca &amp; Oranye</option>
                </select>
              </div>
              <div>
                <label htmlFor="pencahayaan_anjungan" className="mb-1 block text-sm font-medium">
                  Pencahayaan Anjungan
                </label>
                <select
                  id="pencahayaan_anjungan"
                  name="pencahayaan_anjungan"
                  defaultValue={settings.pencahayaan_anjungan}
                  className="form-control input-sm"
                >
                  <option value="light">Terang</option>
                  <option value="dark">Gelap</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 pt-4">
              {canUpdate && storageAvailable ? (
                <Btn type="submit" color="info" disabled={saving}>
                  <i className="fa fa-check" aria-hidden="true" /> {saving ? "Menyimpan..." : "Simpan"}
                </Btn>
              ) : (
                <span className="text-sm text-gray-500">Akses ubah tidak tersedia.</span>
              )}
            </div>
          </fieldset>
        </form>
      </Box>

      <Box title="Kontrol Belum Tersedia">
        <p className="mb-2 text-sm text-gray-700">
          Pengunggahan ikon, gambar, dan video tidak dilakukan dari halaman ini. Pilihan galeri hanya
          menggunakan album aktif yang sudah tersimpan untuk tenant.
        </p>
        <p className="mb-0 text-sm text-gray-700">
          Pengaturan audio screensaver tidak ditulis oleh pengontrol Pengaturan Anjungan saat ini,
          sehingga ditampilkan sebagai tidak tersedia dan tidak disimulasikan.
        </p>
      </Box>
    </div>
  )
}
