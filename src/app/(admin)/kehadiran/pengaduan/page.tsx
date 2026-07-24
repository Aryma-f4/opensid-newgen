import { Box, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Page() {
  const rows = await prisma.kehadiran_pengaduan.findMany({
    orderBy: { waktu: "desc" },
    take: 100,
  })

  return (
    <div>
      <ContentHeader
        title="Pengaduan Kehadiran"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Pengaduan" }]}
      />
      <Box title={`100 Pengaduan Terbaru (${rows.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Waktu</Th>
              <Th>Keterangan</Th>
              <Th>Status</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={3} className="py-8 text-center text-gray-400">
                Tidak ada data
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.waktu.toLocaleString("id-ID")}</Td>
                <Td>{row.keterangan ?? "-"}</Td>
                <Td>{row.status ? "Selesai" : "Belum selesai"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
