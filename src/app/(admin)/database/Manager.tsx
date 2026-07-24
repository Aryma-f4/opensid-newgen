"use client"

import { Box, SmallBox, LteTable, Th, Td } from "@/components/admin/Ui"

export default function DatabaseManager({
  migrations,
  count,
}: {
  migrations: any[]
  count: number
}) {
  const latestVersi = migrations.length > 0 ? (migrations[0].versi ?? migrations[0].versi_database ?? "-") : "-"

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <SmallBox
          value={count.toLocaleString("id-ID")}
          label="Total Migrasi"
          icon="fa-database"
          color="aqua"
        />
        <SmallBox
          value={String(latestVersi)}
          label="Versi Terakhir"
          icon="fa-tag"
          color="green"
        />
      </div>
      <Box title={`Riwayat Migrasi (${count})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Versi</Th>
              <Th>Tanggal</Th>
              <Th>Status</Th>
            </>
          }
        >
          {migrations.length === 0 ? (
            <tr>
              <Td colSpan={3} className="text-center py-8 text-gray-400">
                Tidak ada data
              </Td>
            </tr>
          ) : (
            migrations.map((r) => (
              <tr key={r.id}>
                <Td className="font-mono">
                  {r.versi ?? r.versi_database ?? "-"}
                </Td>
                <Td>{r.tanggal?.toLocaleDateString("id-ID") ?? "-"}</Td>
                <Td>{r.status === 1 ? "Berhasil" : "Gagal"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
