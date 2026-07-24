import { prisma } from "@/lib/prisma"
import {
  ContentHeader,
  Box,
  LteTable,
  Th,
  Td,
  StatusLabel,
  Paging,
} from "@/components/admin/Ui"
import SmsManager from "./Manager"

export const dynamic = "force-dynamic"

const perPage = 50

export default async function SmsInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const [rows, total] = await Promise.all([
    prisma.inbox.findMany({
      orderBy: { ReceivingDateTime: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.inbox.count(),
  ])
  return (
    <div>
      <ContentHeader
        title="SMS"
        subtitle="Inbox"
        breadcrumb={[{ label: "SMS" }, { label: "Inbox" }]}
      />
      <SmsManager />
      <Box
        title={`Kotak Masuk (${total.toLocaleString("id-ID")})`}
        noPadding
      >
        <LteTable
          head={
            <>
              <Th>Tanggal</Th>
              <Th>Pengirim</Th>
              <Th>Pesan</Th>
              <Th>Diproses</Th>
            </>
          }
        >
          {rows.map((row) => (
            <tr key={row.ID}>
              <Td>{row.ReceivingDateTime.toLocaleString("id-ID")}</Td>
              <Td>{row.SenderNumber}</Td>
              <Td>{row.TextDecoded}</Td>
              <Td>
                <StatusLabel
                  ok={String(row.Processed) === "true"}
                  yes="Ya"
                  no="Tidak"
                />
              </Td>
            </tr>
          ))}
        </LteTable>
      </Box>
      <Paging base="/sms" page={page} pages={Math.ceil(total / perPage)} />
    </div>
  )
}
