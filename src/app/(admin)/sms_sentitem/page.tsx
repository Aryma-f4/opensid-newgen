import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

const perPage = 50

export default async function SmsSentItemPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const [rows, total] = await Promise.all([
    prisma.sentitems.findMany({ orderBy: { SendingDateTime: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.sentitems.count(),
  ])
  return (
    <div>
      <ContentHeader title="SMS Terkirim" breadcrumb={[{ label: "SMS" }, { label: "Terkirim" }]} />
      <Box title={`Pesan Terkirim (${total.toLocaleString("id-ID")})`} noPadding>
        <LteTable head={<><Th>Tanggal</Th><Th>Tujuan</Th><Th>Pesan</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={`${row.ID}-${row.SequencePosition}`}><Td>{row.SendingDateTime.toLocaleString("id-ID")}</Td><Td>{row.DestinationNumber}</Td><Td>{row.TextDecoded}</Td><Td>{String(row.Status)}</Td></tr>
          ))}
        </LteTable>
      </Box>
      <Paging base="/sms_sentitem" page={page} pages={Math.ceil(total / perPage)} />
    </div>
  )
}
