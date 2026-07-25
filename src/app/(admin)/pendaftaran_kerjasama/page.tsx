import { Box, ContentHeader } from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"
import {
  buildIntegrationDiagnostics,
  isPartnershipIdentityComplete,
  type IntegrationSettingValues,
  tenantIntegrationSettingsWhere,
} from "@/lib/integrationConfig"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const moduleUrl = "pendaftaran_kerjasama"

const emptySettings: IntegrationSettingValues = {
  layanan_opendesa_token: "",
  sinkronisasi_opendk: "",
  api_opendk_server: "",
  api_opendk_key: "",
}

function valueOrMissing(value: string | null | undefined) {
  return value?.trim()
    ? value
    : <span className="text-gray-400">Belum diisi</span>
}

export default async function PartnershipRegistrationPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [village, records] = await Promise.all([
    prisma.config.findUnique({
      where: { id: actor.configId },
      select: {
        nama_desa: true,
        kode_desa: true,
        email_desa: true,
        nama_kontak: true,
        hp_kontak: true,
        jabatan_kontak: true,
      },
    }),
    prisma.setting_aplikasi.findMany({
      where: tenantIntegrationSettingsWhere(actor.configId),
      select: { key: true, value: true },
    }),
  ])

  const settings = { ...emptySettings }
  for (const record of records) {
    if (record.key && record.key in settings) {
      settings[record.key as keyof IntegrationSettingValues] = record.value ?? ""
    }
  }
  const diagnostics = buildIntegrationDiagnostics(settings)
  const identityComplete = isPartnershipIdentityComplete({
    nama_desa: village?.nama_desa,
    kode_desa: village?.kode_desa,
    email_desa: village?.email_desa,
    nama_kontak: village?.nama_kontak,
    hp_kontak: village?.hp_kontak,
  })

  return (
    <div>
      <ContentHeader
        title="Pendaftaran Kerjasama"
        subtitle="Kesiapan data lokal untuk Layanan OpenDESA"
        breadcrumb={[{ label: "Info Desa" }, { label: "Pendaftaran Kerjasama" }]}
      />

      <div className="alert alert-info">
        Status pendaftaran hanya dapat dipastikan oleh API Layanan OpenDESA.
        Halaman ini tidak menghubungi layanan tersebut, sehingga tidak menganggap token
        lokal sebagai bukti kerjasama aktif.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Box color="info" title="Identitas Pengajuan">
          <dl className="mb-0 grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
            <dt>Desa</dt><dd>{valueOrMissing(village?.nama_desa)}</dd>
            <dt>Kode desa</dt><dd>{valueOrMissing(village?.kode_desa)}</dd>
            <dt>Email</dt><dd>{valueOrMissing(village?.email_desa)}</dd>
            <dt>Nama kontak</dt><dd>{valueOrMissing(village?.nama_kontak)}</dd>
            <dt>Jabatan kontak</dt><dd>{valueOrMissing(village?.jabatan_kontak)}</dd>
            <dt>Nomor HP</dt><dd>{valueOrMissing(village?.hp_kontak)}</dd>
          </dl>
        </Box>

        <Box color={identityComplete ? "success" : "warning"} title="Diagnostik Lokal">
          <dl className="mb-4 grid grid-cols-[minmax(9rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
            <dt>Identitas minimum</dt>
            <dd>
              {identityComplete
                ? <span className="label label-success">Lengkap</span>
                : <span className="label label-warning">Belum lengkap</span>}
            </dd>
            <dt>Token layanan</dt>
            <dd>
              {diagnostics.marketplaceCredential === "configured"
                ? <span className="label label-success">Tersimpan</span>
                : <span className="label label-warning">Belum tersedia</span>}
            </dd>
            <dt>Status kerjasama</dt>
            <dd><span className="label label-default">Belum diverifikasi</span></dd>
          </dl>
          <button className="btn btn-default btn-sm" disabled aria-disabled="true">
            <i className="fa fa-paper-plane" /> Kirim pendaftaran
          </button>
          <p className="help-block mb-0">
            Pengiriman PDF dan pemeriksaan status dinonaktifkan sampai klien layanan
            terautentikasi beserta penanganan responsnya diimplementasikan.
          </p>
        </Box>
      </div>
    </div>
  )
}
