"use client"

import { Box, SmallBox, DetailTable, LteTable, Th, Td } from "@/components/admin/Ui"

type ConfigInfo = {
  nama_desa?: string | null
  nama_kecamatan?: string | null
  nama_kabupaten?: string | null
  nama_propinsi?: string | null
  email_desa?: string | null
  telepon?: string | null
  alamat_kantor?: string | null
  kode_pos?: string | null
}

type SettingItem = {
  id: number
  key: string | null
  value: string | null
  kategori: string | null
}

export default function Manager({
  config,
  settings,
  settingCount,
}: {
  config: ConfigInfo | null
  settings: SettingItem[]
  settingCount: number
}) {
  return (
    <div>
      {/* ── Dashboard stat cards ── */}
      <div className="flex flex-wrap gap-4 mb-4">
        <SmallBox value={8} label="Informasi Desa" icon="fa-gear" color="aqua" />
        <SmallBox
          value={settingCount.toLocaleString("id-ID")}
          label="Pengaturan Aplikasi"
          icon="fa-sliders"
          color="green"
        />
        <SmallBox value="Next.js" label="Platform (opensid-newgen)" icon="fa-laptop" color="blue" />
      </div>

      {config && (
        <Box title="Informasi Desa" noPadding>
          <DetailTable
            rows={[
              ["Nama Desa", config.nama_desa ?? "-"],
              ["Kecamatan", config.nama_kecamatan ?? "-"],
              ["Kabupaten", config.nama_kabupaten ?? "-"],
              ["Provinsi", config.nama_propinsi ?? "-"],
              ["Email", config.email_desa ?? "-"],
              ["Telepon", config.telepon ?? "-"],
              ["Alamat Kantor", config.alamat_kantor ?? "-"],
              ["Kode Pos", config.kode_pos ?? "-"],
              ["Platform", "Next.js (opensid-newgen)"],
            ]}
          />
        </Box>
      )}

      <Box title="Info Aplikasi" noPadding>
        <DetailTable
          rows={[
            ["Framework", "Next.js 14+"],
            ["Database", "MySQL"],
            ["ORM", "Prisma"],
            ["Bahasa", "TypeScript"],
          ]}
        />
      </Box>

      <Box title={`Pengaturan Aplikasi (${settings.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Key</Th>
              <Th>Value</Th>
              <Th>Kategori</Th>
            </>
          }
        >
          {settings.length === 0 ? (
            <tr>
              <Td colSpan={3} className="text-center py-8 text-gray-400">
                Tidak ada data
              </Td>
            </tr>
          ) : (
            settings.map((r) => (
              <tr key={r.id}>
                <Td className="font-mono">{r.key}</Td>
                <Td className="max-w-xs truncate">{r.value ?? "-"}</Td>
                <Td>{r.kategori ?? "-"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
