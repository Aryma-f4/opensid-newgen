import assert from "node:assert/strict"
import test from "node:test"

import {
  buildIntegrationDiagnostics,
  INTEGRATION_SETTING_KEYS,
  isPartnershipIdentityComplete,
  parseQrCodeInput,
  tenantIntegrationSettingsWhere,
} from "../src/lib/integrationConfig"

function form(values: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) formData.set(key, value)
  return formData
}

test("QR input preserves payload text and allowlists legacy local options", () => {
  const parsed = parseQrCodeInput(form({
    content: "  https://desa.example.id/verifikasi?id=17  ",
    size: "150",
    foreground: "#0A4B7A",
    config_id: "999",
    logo_path: "../../secret.png",
  }))

  assert.deepEqual(parsed, {
    content: "  https://desa.example.id/verifikasi?id=17  ",
    size: 150,
    foreground: "#0a4b7a",
  })
  assert.equal("config_id" in parsed, false)
  assert.equal("logo_path" in parsed, false)
})

test("QR input rejects empty, oversized, and unsupported content settings", () => {
  assert.throws(
    () => parseQrCodeInput(form({ content: " ", size: "150", foreground: "#000000" })),
    /Isi QR Code wajib diisi/,
  )
  assert.throws(
    () => parseQrCodeInput(form({
      content: "x".repeat(301),
      size: "150",
      foreground: "#000000",
    })),
    /maksimal 300 karakter/,
  )
  assert.throws(
    () => parseQrCodeInput(form({ content: "OpenSID", size: "151", foreground: "#000000" })),
    /Ukuran QR Code tidak valid/,
  )
  assert.throws(
    () => parseQrCodeInput(form({ content: "OpenSID", size: "150", foreground: "black" })),
    /Warna QR Code tidak valid/,
  )
})

test("integration settings predicate binds every read to the authenticated tenant", () => {
  assert.deepEqual(tenantIntegrationSettingsWhere(7), {
    config_id: 7,
    key: { in: [...INTEGRATION_SETTING_KEYS] },
  })
  assert.throws(() => tenantIntegrationSettingsWhere(0), /Tenant tidak valid/)
})

test("partnership readiness rejects whitespace-only required identity fields", () => {
  const complete = {
    nama_desa: "Desa Sukamaju",
    kode_desa: "32.01.01.2001",
    email_desa: "desa@example.id",
    nama_kontak: "Siti Aminah",
    hp_kontak: "081234567890",
  }

  assert.equal(isPartnershipIdentityComplete(complete), true)
  assert.equal(isPartnershipIdentityComplete({ ...complete, email_desa: " \n " }), false)
  assert.equal(isPartnershipIdentityComplete({ ...complete, hp_kontak: null }), false)
})

test("external diagnostics distinguish local configuration from remote verification", () => {
  assert.deepEqual(
    buildIntegrationDiagnostics({
      layanan_opendesa_token: "secret-token",
      sinkronisasi_opendk: "1",
      api_opendk_server: "https://opendk.example.id/",
      api_opendk_key: "secret-key",
    }),
    {
      marketplaceCredential: "configured",
      partnershipStatus: "unverified",
      synchronization: {
        enabled: true,
        server: "https://opendk.example.id",
        serverValid: true,
        credentialConfigured: true,
        remoteStatus: "unverified",
      },
    },
  )
})

test("external diagnostics preserve a valid OpenDK base path", () => {
  const diagnostics = buildIntegrationDiagnostics({
    layanan_opendesa_token: "",
    sinkronisasi_opendk: "1",
    api_opendk_server: "https://opendk.example.id/api/opendk/",
    api_opendk_key: "secret-key",
  })

  assert.equal(diagnostics.synchronization.server, "https://opendk.example.id/api/opendk")
  assert.equal(diagnostics.synchronization.serverValid, true)
  assert.equal(diagnostics.synchronization.remoteStatus, "unverified")
})

test("external diagnostics reject unsafe server schemes and never imply remote success", () => {
  const diagnostics = buildIntegrationDiagnostics({
    layanan_opendesa_token: "",
    sinkronisasi_opendk: "1",
    api_opendk_server: "javascript:alert(1)",
    api_opendk_key: "",
  })

  assert.equal(diagnostics.marketplaceCredential, "missing")
  assert.equal(diagnostics.partnershipStatus, "unverified")
  assert.deepEqual(diagnostics.synchronization, {
    enabled: true,
    server: null,
    serverValid: false,
    credentialConfigured: false,
    remoteStatus: "unverified",
  })
})
