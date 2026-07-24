import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader, Box, SmallBox, LteTable, Th, Td, Btn } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function PelangganPage() {
  const [config, settings] = await Promise.all([
    prisma.config.findFirst({ orderBy: { id: "asc" } }),
    prisma.setting_aplikasi.findMany({ where: { key: { contains: "pelanggan" } } }),
  ])

  return (
    <div>
      <ContentHeader title="Pelanggan" subtitle="Layanan Pelanggan OpenSID" breadcrumb={[{ label: "Modul" }, { label: "Pelanggan" }]} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <SmallBox value={settings.length > 0 ? "Terdaftar" : "Belum"} label="Status Langganan" icon="fa-check-circle" color={settings.length > 0 ? "green" : "yellow"} />
        <SmallBox value={config?.nama_desa ?? "-"} label="Desa" icon="fa-home" color="blue" />
        <SmallBox value="OpenSID" label="Platform" icon="fa-cube" color="purple" />
      </div>

      <Box title="Informasi Pelanggan" color="primary">
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Modul Pelanggan adalah layanan integrasi dengan <strong>layanan.opendesa.id</strong>
            untuk manajemen lisensi, langganan, dan kerjasama dengan OpenDesa.
          </p>

          <LteTable head={<><Th>Pengaturan</Th><Th>Nilai</Th></>}>
            <tr><Td>Nama Desa</Td><Td>{config?.nama_desa ?? "-"}</Td></tr>
            <tr><Td>Kecamatan</Td><Td>{config?.nama_kecamatan ?? "-"}</Td></tr>
            <tr><Td>Kabupaten</Td><Td>{config?.nama_kabupaten ?? "-"}</Td></tr>
            <tr><Td>Provinsi</Td><Td>{config?.nama_propinsi ?? "-"}</Td></tr>
            <tr><Td>Email Desa</Td><Td>{config?.email_desa ?? "-"}</Td></tr>
            <tr><Td>Telepon</Td><Td>{config?.telepon ?? "-"}</Td></tr>
          </LteTable>
        </div>
      </Box>

      <Box title="Pengaturan Pelanggan" noPadding>
        <LteTable head={<><Th>Key</Th><Th>Value</Th></>}>
          {settings.length === 0 ? (
            <tr><Td colSpan={2} className="text-center py-8 text-gray-400">Belum ada pengaturan pelanggan</Td></tr>
          ) : settings.map((s: any) => (
            <tr key={s.id}><Td className="font-mono">{s.key}</Td><Td>{s.value ?? "-"}</Td></tr>
          ))}
        </LteTable>
      </Box>

      <Box title="Pendaftaran Kerjasama">
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Untuk mendaftarkan desa anda dalam program kerjasama dengan OpenDesa,
            silakan menghubungi melalui portal layanan resmi.
          </p>
          <div className="flex gap-3">
            <a href="https://layanan.opendesa.id" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              <i className="fa fa-external-link" /> Buka Layanan OpenDesa
            </a>
            <Link href="/setting" className="btn btn-default btn-sm">
              <i className="fa fa-cog" /> Pengaturan
            </Link>
          </div>
        </div>
      </Box>
    </div>
  )
}
