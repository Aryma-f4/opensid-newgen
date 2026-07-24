import { Box, ContentHeader, LteTable, Paging, Td, Th } from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"
import { satisfactionPageWindow } from "@/lib/bukuTamuConfig"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const answerLabels: Record<number, string> = {
  1: "Sangat Puas",
  2: "Puas",
  3: "Cukup Puas",
  4: "Tidak Puas",
}

function answerClass(answer: number): string {
  if (answer === 1) return "label label-success"
  if (answer === 2) return "label label-primary"
  if (answer === 3) return "label label-warning"
  return "label label-danger"
}

function formatDate(value: Date | null): string {
  if (!value) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value)
}

export default async function BukuKepuasanPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const actor = await requireAdminAccess("buku_kepuasan", "b")
  const params = await searchParams
  const total = await prisma.buku_kepuasan.count({
    where: { config_id: actor.configId },
  })
  const pagination = satisfactionPageWindow(params.page, total)
  const responses = await prisma.buku_kepuasan.findMany({
    where: { config_id: actor.configId },
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true,
      id_nama: true,
      id_pertanyaan: true,
      id_jawaban: true,
      pertanyaan_statis: true,
      created_at: true,
    },
  })

  const guestIds = [...new Set(responses.flatMap((response) => response.id_nama ? [response.id_nama] : []))]
  const questionIds = [...new Set(responses.flatMap((response) => response.id_pertanyaan ? [response.id_pertanyaan] : []))]
  const [guests, questions] = await Promise.all([
    prisma.buku_tamu.findMany({
      where: { config_id: actor.configId, id: { in: guestIds } },
      select: { id: true, nama: true },
    }),
    prisma.buku_pertanyaan.findMany({
      where: { config_id: actor.configId, id: { in: questionIds } },
      select: { id: true, pertanyaan: true },
    }),
  ])

  const guestNames = new Map(guests.map((guest) => [guest.id, guest.nama]))
  const questionTexts = new Map(questions.map((question) => [question.id, question.pertanyaan]))

  return (
    <div>
      <ContentHeader
        title="Data Kepuasan"
        subtitle="Jawaban indeks kepuasan pengunjung"
        breadcrumb={[{ label: "Buku Tamu" }, { label: "Data Kepuasan" }]}
      />
      <Box title={`Jawaban Kepuasan (${total})`} noPadding>
        <div className="border-b border-[#f4f4f4] p-3 text-sm text-gray-600">
          Data ini ditampilkan hanya sebagai hasil survei. Jawaban asli tidak dapat diubah dari halaman admin.
        </div>
        <LteTable
          head={
            <>
              <Th className="w-14">No.</Th>
              <Th className="w-52">Hari / Tanggal</Th>
              <Th>Nama</Th>
              <Th>Pertanyaan</Th>
              <Th className="w-32">Jawaban</Th>
            </>
          }
        >
          {responses.length === 0 ? (
            <tr>
              <Td colSpan={5} className="py-8 text-center text-gray-400">
                Belum ada jawaban kepuasan
              </Td>
            </tr>
          ) : responses.map((response, index) => {
            const currentQuestion = response.id_pertanyaan
              ? questionTexts.get(response.id_pertanyaan)
              : null
            const question = response.pertanyaan_statis?.trim() || currentQuestion || "Pertanyaan tidak tersedia"
            const guest = response.id_nama
              ? guestNames.get(response.id_nama) ?? "Tamu tidak tersedia"
              : "Tamu tidak tersedia"

            return (
              <tr key={response.id}>
                <Td>{pagination.skip + index + 1}</Td>
                <Td>{formatDate(response.created_at)}</Td>
                <Td>{guest}</Td>
                <Td>{question}</Td>
                <Td>
                  <span className={answerClass(response.id_jawaban)}>
                    {answerLabels[response.id_jawaban] ?? `Jawaban ${response.id_jawaban}`}
                  </span>
                </Td>
              </tr>
            )
          })}
        </LteTable>
        <div className="border-t border-[#f4f4f4] p-3">
          <Paging
            base="/buku_kepuasan"
            page={pagination.page}
            pages={pagination.pages}
          />
        </div>
      </Box>
    </div>
  )
}
