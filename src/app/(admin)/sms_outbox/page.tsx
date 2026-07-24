import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const perPage = 50

export default async function SmsOutboxPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const [rows, total] = await Promise.all([
    prisma.outbox.findMany({ orderBy: { InsertIntoDB: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.outbox.count(),
  ])
  return (
    <div>
      <ContentHeader title="SMS Outbox" breadcrumb={[{ label: "SMS" }, { label: "Outbox" }]} />
      <Box title={`Kotak Keluar (${total.toLocaleString("id-ID")})`} noPadding>
        <LteTable head={<><Th>Tanggal</Th><Th>Tujuan</Th><Th>Pesan</Th><Th>Pengirim</Th></>}>
          {rows.map((row) => (
            <tr key={row.ID}><Td>{row.InsertIntoDB.toLocaleString("id-ID")}</Td><Td>{row.DestinationNumber}</Td><Td>{row.TextDecoded}</Td><Td>{row.SenderID ?? "-"}</Td></tr>
          ))}
        </LteTable>
      </Box>
      <Paging base="/sms_outbox" page={page} pages={Math.ceil(total / perPage)} />
    </div>
  )
}
