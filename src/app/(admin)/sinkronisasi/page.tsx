import {
  Box,
  ContentHeader,
  LteTable,
  Td,
  Th,
} from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"
import {
  buildIntegrationDiagnostics,
  type IntegrationSettingValues,
  tenantIntegrationSettingsWhere,
} from "@/lib/integrationConfig"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const moduleUrl = "sinkronisasi"

const emptySettings: IntegrationSettingValues = {
  layanan_opendesa_token: "",
  sinkronisasi_opendk: "",
  api_opendk_server: "",
  api_opendk_key: "",
}

function formatDate(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(value)
    : "-"
}

export default async function SynchronizationPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, syncLogs, reportLogs] = await Promise.all([
    prisma.setting_aplikasi.findMany({
      where: tenantIntegrationSettingsWhere(actor.configId),
      select: { key: true, value: true },
    }),
    prisma.log_sinkronisasi.findMany({
      where: { config_id: actor.configId },
      orderBy: { updated_at: "desc" },
      take: 25,
      select: { id: true, modul: true, created_at: true, updated_at: true },
    }),
    prisma.laporan_sinkronisasi.findMany({
      where: { config_id: actor.configId },
      orderBy: { updated_at: "desc" },
      take: 25,
      select: {
        id: true,
        tipe: true,
        judul: true,
        tahun: true,
        semester: true,
        nama_file: true,
        kirim: true,
        updated_at: true,
      },
    }),
  ])

  const settings = { ...emptySettings }
  for (const record of records) {
    if (record.key && record.key in settings) {
      settings[record.key as keyof IntegrationSettingValues] = record.value ?? ""
    }
  }
  const diagnostics = buildIntegrationDiagnostics(settings)
  const sync = diagnostics.synchronization

  return (
    <div>
      <ContentHeader
        title="Sinkronisasi"
        subtitle="Diagnostik lokal OpenDK"
        breadcrumb={[{ label: "OpenDK" }, { label: "Sinkronisasi" }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Box color={sync.enabled ? "success" : "default"} title="Fitur Lokal">
          <p className="mb-2 text-sm">Konfigurasi sinkronisasi:</p>
          {sync.enabled
            ? <span className="label label-success">Diaktifkan</span>
            : <span className="label label-default">Dinonaktifkan</span>}
        </Box>
        <Box color={sync.serverValid ? "success" : "warning"} title="Server OpenDK">
          <p className="mb-2 break-all text-sm">{sync.server ?? "Alamat server belum valid."}</p>
          {sync.serverValid
            ? <span className="label label-success">URL lokal valid</span>
            : <span className="label label-warning">Belum siap</span>}
        </Box>
        <Box color={sync.credentialConfigured ? "success" : "warning"} title="Kredensial">
          <p className="mb-2 text-sm">API key tidak pernah ditampilkan kembali.</p>
          {sync.credentialConfigured
            ? <span className="label label-success">Tersimpan</span>
            : <span className="label label-warning">Belum tersedia</span>}
        </Box>
      </div>

      <Box
        color="warning"
        title="Operasi OpenDK Dinonaktifkan"
        tools={<span className="label label-default">Status remote belum diverifikasi</span>}
      >
        <p className="text-sm text-gray-700">
          Tombol kirim, unduh, dan sinkronisasi inkremental pada aplikasi lama memerlukan
          ekspor data, API key, kontrak respons OpenDK, serta penanganan kegagalan parsial.
          NewGen belum memiliki klien tersebut dan tidak akan mencatat keberhasilan palsu.
        </p>
        {["Identitas Desa", "Penduduk", "Program Bantuan", "Pembangunan"].map((label) => (
          <button
            key={label}
            className="btn btn-default btn-sm mr-2 mb-2"
            disabled
            aria-disabled="true"
          >
            <i className="fa fa-random" /> Kirim {label}
          </button>
        ))}
      </Box>

      <Box title={`Log Sinkronisasi Lokal (${syncLogs.length})`} noPadding>
        <LteTable
          head={<><Th>Modul</Th><Th>Dibuat</Th><Th>Diperbarui</Th></>}
        >
          {syncLogs.length === 0 ? (
            <tr><Td colSpan={3} className="py-8 text-center text-gray-400">Belum ada log sinkronisasi</Td></tr>
          ) : syncLogs.map((log) => (
            <tr key={log.id}>
              <Td>{log.modul}</Td>
              <Td>{formatDate(log.created_at)}</Td>
              <Td>{formatDate(log.updated_at)}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <Box title={`Laporan Sinkronisasi Lokal (${reportLogs.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Judul</Th>
              <Th>Tipe</Th>
              <Th>Periode</Th>
              <Th>Nama File</Th>
              <Th>Dikirim (catatan lokal)</Th>
              <Th>Diperbarui</Th>
            </>
          }
        >
          {reportLogs.length === 0 ? (
            <tr><Td colSpan={6} className="py-8 text-center text-gray-400">Belum ada laporan sinkronisasi</Td></tr>
          ) : reportLogs.map((report) => (
            <tr key={report.id}>
              <Td>{report.judul}</Td>
              <Td>{report.tipe ?? "-"}</Td>
              <Td>{report.tahun} / semester {report.semester}</Td>
              <Td>{report.nama_file}</Td>
              <Td>{formatDate(report.kirim)}</Td>
              <Td>{formatDate(report.updated_at)}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
