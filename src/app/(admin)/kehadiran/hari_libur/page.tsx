import { Box, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Page() {
  const rows = await prisma.kehadiran_hari_libur.findMany({
    orderBy: { tanggal: "desc" },
    take: 100,
  })

  return (
    <div>
      <ContentHeader
        title="Hari Libur"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Hari Libur" }]}
      />
      <Box title={`100 Hari Libur Terbaru (${rows.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Tanggal</Th>
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
                <Td>{row.tanggal.toLocaleDateString("id-ID")}</Td>
                <Td>{row.keterangan ?? "-"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
