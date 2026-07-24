import { Box, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Page() {
  const rows = await prisma.covid19_pantau.findMany({
    orderBy: { id: "desc" },
    take: 100,
  })

  return (
    <div>
      <ContentHeader
        title="Pemantauan Covid-19"
        breadcrumb={[{ label: "Covid-19" }, { label: "Pantau" }]}
      />
      <Box title={`100 Data Pemantauan Terbaru (${rows.length})`} noPadding>
        <LteTable
          head={
            <>
              <Th>Waktu</Th>
              <Th>Suhu Tubuh</Th>
              <Th>Batuk</Th>
              <Th>Flu</Th>
              <Th>Sesak Nafas</Th>
              <Th>Status Covid</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={6} className="py-8 text-center text-gray-400">
                Tidak ada data
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.tanggal_jam?.toLocaleString("id-ID") ?? "-"}</Td>
                <Td>
                  {row.suhu_tubuh === null ? "-" : `${row.suhu_tubuh.toString()} °C`}
                </Td>
                <Td>{row.batuk ?? "-"}</Td>
                <Td>{row.flu ?? "-"}</Td>
                <Td>{row.sesak_nafas ?? "-"}</Td>
                <Td>{row.status_covid ?? "-"}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
