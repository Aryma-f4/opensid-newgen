import { Box, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const formatTime = (value: Date) =>
  value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })

export default async function Page() {
  const rows = await prisma.kehadiran_jam_kerja.findMany({
    orderBy: { id: "desc" },
    take: 100,
  })

  return (
    <div>
      <ContentHeader
        title="Jam Kerja"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Jam Kerja" }]}
      />
      <Box title={`Jadwal Jam Kerja (${rows.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Hari</Th>
              <Th>Jam Masuk</Th>
              <Th>Jam Pulang</Th>
              <Th>Status</Th>
              <Th>Keterangan</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={5} className="py-8 text-center text-gray-400">
                Tidak ada data
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.nama_hari}</Td>
                <Td>{formatTime(row.jam_masuk)}</Td>
                <Td>{formatTime(row.jam_keluar)}</Td>
                <Td>{row.status ? "Aktif" : "Nonaktif"}</Td>
                <Td>{row.keterangan ?? "-"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
