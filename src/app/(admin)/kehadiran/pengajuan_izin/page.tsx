import { Box, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Page() {
  const rows = await prisma.kehadiran_pengajuan_izin.findMany({
    include: {
      tweb_desa_pamong: {
        select: { pamong_nama: true },
      },
    },
    orderBy: { id: "desc" },
    take: 100,
  })

  return (
    <div>
      <ContentHeader
        title="Status Pengajuan Izin"
        subtitle="Hanya baca"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Pengajuan Izin" }]}
      />
      <Box title={`100 Status Pengajuan Izin Terbaru (${rows.length})`} noPadding>
        <p className="m-0 border-b border-[#f4f4f4] p-3 text-sm text-gray-600">
          Halaman ini hanya menampilkan status pengajuan. Persetujuan dan
          penolakan belum tersedia di OpenSID NewGen.
        </p>
        <LteTable
          head={
            <>
              <Th>Perangkat</Th>
              <Th>Jenis Izin</Th>
              <Th>Mulai</Th>
              <Th>Selesai</Th>
              <Th>Keterangan</Th>
              <Th>Status</Th>
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
              <tr key={row.id.toString()}>
                <Td>{row.tweb_desa_pamong.pamong_nama ?? "-"}</Td>
                <Td>{row.jenis_izin}</Td>
                <Td>{row.tanggal_mulai.toLocaleDateString("id-ID")}</Td>
                <Td>{row.tanggal_selesai.toLocaleDateString("id-ID")}</Td>
                <Td>{row.keterangan}</Td>
                <Td>{row.status_approval}</Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>
    </div>
  )
}
