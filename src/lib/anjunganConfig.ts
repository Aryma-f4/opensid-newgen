export class AnjunganInputError extends Error {}

const LINK_TYPES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 99])
const PROFILE_TYPES = new Set(["1", "2", "3"])
const SCREENSAVER_TYPES = new Set(["0", "1", "2"])
const COLOR_TYPES = new Set(["nature", "travel", "casual"])
const LIGHTING_TYPES = new Set(["light", "dark"])

export const ANJUNGAN_SETTING_KEYS = [
  "sebutan_anjungan_mandiri",
  "anjungan_artikel",
  "anjungan_teks_berjalan",
  "anjungan_profil",
  "anjungan_slide",
  "anjungan_video",
  "anjungan_youtube",
  "tampilan_anjungan",
  "tampilan_anjungan_waktu",
  "tampilan_anjungan_slider",
  "tampilan_anjungan_video",
  "warna_anjungan",
  "pencahayaan_anjungan",
] as const

export type AnjunganSettingKey = typeof ANJUNGAN_SETTING_KEYS[number]
export type AnjunganSettingUpdates = Record<AnjunganSettingKey, string>

function cleanText(value: FormDataEntryValue | null): string {
  return typeof value === "string"
    ? value.replace(/<[^>]*>/g, "").trim()
    : ""
}

function boundedText(
  formData: FormData,
  field: string,
  label: string,
  maxLength: number,
  required = false,
): string {
  const value = cleanText(formData.get(field))
  if (required && !value) throw new AnjunganInputError(`${label} wajib diisi.`)
  if (value.length > maxLength) {
    throw new AnjunganInputError(`${label} maksimal ${maxLength} karakter.`)
  }
  return value
}

function positiveInteger(value: unknown, message: string): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new AnjunganInputError(message)
  }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new AnjunganInputError(message)
  return parsed
}

function optionalPositiveInteger(value: FormDataEntryValue | null, message: string): string {
  const clean = cleanText(value)
  if (!clean) return ""
  return String(positiveInteger(clean, message))
}

function enumValue(
  formData: FormData,
  field: string,
  allowed: ReadonlySet<string>,
  message: string,
): string {
  const value = cleanText(formData.get(field))
  if (!allowed.has(value)) throw new AnjunganInputError(message)
  return value
}

function httpUrl(value: string, label: string): string {
  if (!value) return ""

  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocol")
    return value
  } catch {
    throw new AnjunganInputError(`${label} harus berupa URL HTTP atau HTTPS.`)
  }
}

function mp4Url(value: string, label: string): string {
  if (!value) return ""

  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value)
    if (value.startsWith("//")) throw new Error("protocol")
    const url = hasScheme ? new URL(value) : new URL(value, "https://opensid.local")
    if (hasScheme && url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("protocol")
    }
    if (!url.pathname.toLowerCase().endsWith(".mp4")) throw new Error("extension")
    return value
  } catch {
    throw new AnjunganInputError(`${label} harus berupa URL HTTP/HTTPS atau path lokal berformat .mp4.`)
  }
}

function youtubeId(value: string): string {
  if (!value) return ""
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value

  try {
    const url = new URL(value)
    const candidate = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).at(-1) || ""
    if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) return candidate
  } catch {
    // Fall through to the same stable validation error.
  }

  throw new AnjunganInputError("ID YouTube tidak valid.")
}

export function parseAnjunganMenuInput(formData: FormData) {
  const nama = boundedText(formData, "nama", "Nama menu", 50, true)
  const link = boundedText(formData, "link", "Link menu", 2048, true)
  const linkTipeRaw = cleanText(formData.get("link_tipe"))
  const linkTipe = /^\d+$/.test(linkTipeRaw) ? Number(linkTipeRaw) : Number.NaN
  if (!LINK_TYPES.has(linkTipe)) throw new AnjunganInputError("Jenis link tidak valid.")

  if (linkTipe === 99) {
    httpUrl(link, "Link eksternal")
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith("//")) {
    throw new AnjunganInputError("Link internal tidak valid.")
  }

  const statusRaw = cleanText(formData.get("status"))
  if (statusRaw !== "0" && statusRaw !== "1") {
    throw new AnjunganInputError("Status menu tidak valid.")
  }

  return {
    nama,
    link,
    link_tipe: linkTipe,
    status: Number(statusRaw),
  }
}

export function parseAnjunganMenuId(formData: FormData): number {
  return positiveInteger(formData.get("id"), "Menu tidak valid.")
}

export function parseAnjunganMenuOrder(formData: FormData): number[] {
  const raw = formData.get("order")
  if (typeof raw !== "string") throw new AnjunganInputError("Urutan menu tidak valid.")

  try {
    const order: unknown = JSON.parse(raw)
    if (
      !Array.isArray(order)
      || order.length === 0
      || order.length > 127
      || order.some((id) => !Number.isSafeInteger(id) || id <= 0)
      || new Set(order).size !== order.length
    ) {
      throw new Error("invalid")
    }
    return order as number[]
  } catch {
    throw new AnjunganInputError("Urutan menu tidak valid.")
  }
}

export function menuOrderMatchesTenant(order: number[], tenantIds: number[]): boolean {
  if (order.length !== tenantIds.length) return false
  const tenantSet = new Set(tenantIds)
  return order.every((id) => tenantSet.has(id))
}

export function tenantAnjunganMenuWhere(id: number, configId: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new AnjunganInputError("Menu tidak valid.")
  if (!Number.isSafeInteger(configId) || configId <= 0) {
    throw new AnjunganInputError("Tenant tidak valid.")
  }
  return { id, config_id: configId }
}

export function anjunganCategoryWhere(configId: number) {
  if (!Number.isSafeInteger(configId) || configId <= 0) {
    throw new AnjunganInputError("Tenant tidak valid.")
  }
  return { config_id: configId }
}

export function parseStoredAnjunganArticleIds(value: string): number[] {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    const ids = parsed.flatMap((id) => {
      if (Number.isSafeInteger(id) && id > 0) return [id as number]
      if (typeof id === "string" && /^[1-9]\d*$/.test(id)) {
        const numberId = Number(id)
        if (Number.isSafeInteger(numberId)) return [numberId]
      }
      return []
    })
    return [...new Set(ids)]
  } catch {
    return []
  }
}

export function activeAnjunganGalleryIds(settings: AnjunganSettingUpdates): number[] {
  const ids: number[] = []
  if (settings.anjungan_profil === "1") ids.push(Number(settings.anjungan_slide))
  if (settings.tampilan_anjungan === "1") ids.push(Number(settings.tampilan_anjungan_slider))
  return [...new Set(ids)]
}

export function parseAnjunganSettings(formData: FormData): AnjunganSettingUpdates {
  const articleIds = formData.getAll("anjungan_artikel").map((value) =>
    positiveInteger(value, "Kategori artikel tidak valid."))
  if (new Set(articleIds).size !== articleIds.length) {
    throw new AnjunganInputError("Kategori artikel tidak valid.")
  }

  const profile = enumValue(
    formData,
    "anjungan_profil",
    PROFILE_TYPES,
    "Tampilan profil tidak valid.",
  )
  const profileSlide = optionalPositiveInteger(
    formData.get("anjungan_slide"),
    "Galeri profil tidak valid.",
  )
  const profileVideo = mp4Url(
    boundedText(formData, "anjungan_video", "Video profil", 2048),
    "Video profil",
  )
  const profileYoutube = youtubeId(
    boundedText(formData, "anjungan_youtube", "ID YouTube", 2048),
  )

  if (profile === "1" && !profileSlide) {
    throw new AnjunganInputError("Galeri profil wajib dipilih.")
  }
  if (profile === "2" && !profileVideo) {
    throw new AnjunganInputError("Video profil wajib diisi.")
  }
  if (profile === "3" && !profileYoutube) {
    throw new AnjunganInputError("ID YouTube wajib diisi.")
  }

  const screensaver = enumValue(
    formData,
    "tampilan_anjungan",
    SCREENSAVER_TYPES,
    "Screensaver tidak valid.",
  )
  const screensaverTime = positiveInteger(
    cleanText(formData.get("tampilan_anjungan_waktu")),
    "Waktu screensaver tidak valid.",
  )
  if (screensaverTime > 86_400) {
    throw new AnjunganInputError("Waktu screensaver tidak valid.")
  }

  const screensaverSlide = optionalPositiveInteger(
    formData.get("tampilan_anjungan_slider"),
    "Galeri screensaver tidak valid.",
  )
  const screensaverVideo = mp4Url(
    boundedText(formData, "tampilan_anjungan_video", "Video screensaver", 2048),
    "Video screensaver",
  )
  if (screensaver === "1" && !screensaverSlide) {
    throw new AnjunganInputError("Galeri screensaver wajib dipilih.")
  }
  if (screensaver === "2" && !screensaverVideo) {
    throw new AnjunganInputError("Video screensaver wajib diisi.")
  }

  return {
    sebutan_anjungan_mandiri: boundedText(
      formData,
      "sebutan_anjungan_mandiri",
      "Sebutan anjungan",
      100,
    ),
    anjungan_artikel: JSON.stringify(articleIds),
    anjungan_teks_berjalan: boundedText(
      formData,
      "anjungan_teks_berjalan",
      "Teks berjalan",
      500,
    ),
    anjungan_profil: profile,
    anjungan_slide: profileSlide,
    anjungan_video: profileVideo,
    anjungan_youtube: profileYoutube,
    tampilan_anjungan: screensaver,
    tampilan_anjungan_waktu: String(screensaverTime),
    tampilan_anjungan_slider: screensaverSlide,
    tampilan_anjungan_video: screensaverVideo,
    warna_anjungan: enumValue(
      formData,
      "warna_anjungan",
      COLOR_TYPES,
      "Warna anjungan tidak valid.",
    ),
    pencahayaan_anjungan: enumValue(
      formData,
      "pencahayaan_anjungan",
      LIGHTING_TYPES,
      "Pencahayaan anjungan tidak valid.",
    ),
  }
}
