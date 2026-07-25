export class IntegrationConfigError extends Error {}

export const INTEGRATION_SETTING_KEYS = [
  "layanan_opendesa_token",
  "sinkronisasi_opendk",
  "api_opendk_server",
  "api_opendk_key",
] as const

export const QR_CODE_SIZES = [25, 50, 75, 100, 125, 150, 175, 200, 225, 250] as const

export type IntegrationSettingKey = typeof INTEGRATION_SETTING_KEYS[number]
export type IntegrationSettingValues = Record<IntegrationSettingKey, string>
export type PartnershipIdentity = {
  nama_desa: string | null | undefined
  kode_desa: string | null | undefined
  email_desa: string | null | undefined
  nama_kontak: string | null | undefined
  hp_kontak: string | null | undefined
}

function cleanString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : ""
}

export function parseQrCodeInput(formData: FormData) {
  const rawContent = formData.get("content")
  const content = typeof rawContent === "string" ? rawContent : ""
  if (!content.trim()) throw new IntegrationConfigError("Isi QR Code wajib diisi.")
  if (content.length > 300) {
    throw new IntegrationConfigError("Isi QR Code maksimal 300 karakter.")
  }

  const rawSize = cleanString(formData.get("size"))
  const size = /^\d+$/.test(rawSize) ? Number(rawSize) : Number.NaN
  if (!QR_CODE_SIZES.includes(size as typeof QR_CODE_SIZES[number])) {
    throw new IntegrationConfigError("Ukuran QR Code tidak valid.")
  }

  const foreground = cleanString(formData.get("foreground")).toLowerCase()
  if (!/^#[0-9a-f]{6}$/.test(foreground)) {
    throw new IntegrationConfigError("Warna QR Code tidak valid.")
  }

  return { content, size, foreground }
}

export function tenantIntegrationSettingsWhere(configId: number) {
  if (!Number.isSafeInteger(configId) || configId <= 0) {
    throw new IntegrationConfigError("Tenant tidak valid.")
  }
  return {
    config_id: configId,
    key: { in: [...INTEGRATION_SETTING_KEYS] },
  }
}

export function isPartnershipIdentityComplete(identity: PartnershipIdentity): boolean {
  return [
    identity.nama_desa,
    identity.kode_desa,
    identity.email_desa,
    identity.nama_kontak,
    identity.hp_kontak,
  ].every((value) => Boolean(value?.trim()))
}

function normalizedHttpServer(value: string): { server: string | null; valid: boolean } {
  if (!value.trim()) return { server: null, valid: false }

  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { server: null, valid: false }
    }
    if (url.username || url.password || url.search || url.hash) {
      return { server: null, valid: false }
    }
    const path = url.pathname.replace(/\/+$/, "")
    return {
      server: `${url.origin}${path && path !== "/" ? path : ""}`,
      valid: true,
    }
  } catch {
    return { server: null, valid: false }
  }
}

export function buildIntegrationDiagnostics(settings: IntegrationSettingValues) {
  const syncServer = normalizedHttpServer(settings.api_opendk_server)

  return {
    marketplaceCredential: settings.layanan_opendesa_token.trim()
      ? "configured" as const
      : "missing" as const,
    partnershipStatus: "unverified" as const,
    synchronization: {
      enabled: settings.sinkronisasi_opendk === "1",
      server: syncServer.server,
      serverValid: syncServer.valid,
      credentialConfigured: Boolean(settings.api_opendk_key.trim()),
      remoteStatus: "unverified" as const,
    },
  }
}
