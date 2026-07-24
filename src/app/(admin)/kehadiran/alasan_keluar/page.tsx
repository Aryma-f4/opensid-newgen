import { Box, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Page() {
  const rows = await prisma.kehadiran_alasan_keluar.findMany({
    orderBy: { id: "desc" },
    take: 100,
  })

  return (
    <div>
      <ContentHeader
        title="Alasan Keluar"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Alasan Keluar" }]}
      />
      <Box title={`100 Alasan Keluar Terbaru (${rows.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Alasan</Th>
              <Th>Keterangan</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={2} className="py-8 text-center text-gray-400">
                Tidak ada data
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.alasan}</Td>
                <Td>{row.keterangan ?? "-"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
