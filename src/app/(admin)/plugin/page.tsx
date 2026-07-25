import { Box, ContentHeader } from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"
import {
  buildIntegrationDiagnostics,
  type IntegrationSettingValues,
  tenantIntegrationSettingsWhere,
} from "@/lib/integrationConfig"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const moduleUrl = "plugin"

const emptySettings: IntegrationSettingValues = {
  layanan_opendesa_token: "",
  sinkronisasi_opendk: "",
  api_opendk_server: "",
  api_opendk_key: "",
}

export default async function PluginPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const records = await prisma.setting_aplikasi.findMany({
    where: tenantIntegrationSettingsWhere(actor.configId),
    select: { key: true, value: true },
  })
  const settings = { ...emptySettings }
  for (const record of records) {
    if (record.key && record.key in settings) {
      settings[record.key as keyof IntegrationSettingValues] = record.value ?? ""
    }
  }
  const diagnostics = buildIntegrationDiagnostics(settings)

  return (
    <div>
      <ContentHeader
        title="Paket Tambahan"
        subtitle="Diagnostik lokal marketplace plugin"
        breadcrumb={[{ label: "Pengaturan" }, { label: "Paket Tambahan" }]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Box color="info" title="Kredensial Layanan OpenDESA">
          <dl className="mb-0 grid grid-cols-[minmax(9rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
            <dt>Token lokal</dt>
            <dd>
              {diagnostics.marketplaceCredential === "configured"
                ? <span className="label label-success">Tersimpan</span>
                : <span className="label label-warning">Belum tersedia</span>}
            </dd>
            <dt>Status layanan</dt>
            <dd><span className="label label-default">Belum diverifikasi</span></dd>
            <dt>Inventaris paket</dt>
            <dd>Tidak dimuat tanpa kontrak filesystem tenant yang jelas.</dd>
          </dl>
        </Box>

        <Box color="warning" title="Marketplace Belum Terhubung">
          <p className="text-sm text-gray-700">
            Daftar paket, riwayat pemesanan, pemasangan, pembaruan, dan penghapusan
            pada aplikasi lama bergantung pada API marketplace serta migrasi filesystem
            modul. NewGen belum memiliki klien layanan terautentikasi dan isolasi paket
            per tenant untuk operasi tersebut.
          </p>
          <button className="btn btn-default btn-sm" disabled aria-disabled="true">
            <i className="fa fa-cloud-download" /> Muat marketplace
          </button>{" "}
          <button className="btn btn-default btn-sm" disabled aria-disabled="true">
            <i className="fa fa-cubes" /> Kelola paket
          </button>
        </Box>
      </div>

      <Box color="default" title="Batas Keamanan">
        <p className="mb-0 text-sm text-gray-600">
          Halaman ini hanya membaca keberadaan kredensial tenant dan tidak menampilkan
          nilainya. Tidak ada panggilan ke layanan OpenDESA dan tidak ada perubahan
          filesystem yang dilakukan.
        </p>
      </Box>
    </div>
  )
}
