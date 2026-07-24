import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
const perPage = 50
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams; const page = parseInt(params.page ?? "1"); const q = params.q?.trim() ?? ""
  const where = q ? {
    tweb_desa_pamong: {
      is: { pamong_nama: { contains: q } },
    },
  } : {}
  const [rows, total] = await Promise.all([
    prisma.kehadiran_perangkat_desa.findMany({
      where,
      include: {
        tweb_desa_pamong: {
          include: { ref_jabatan: true },
        },
      },
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.kehadiran_perangkat_desa.count({ where }),
  ])
  return (<div>
    <ContentHeader title="Rekapitulasi Kehadiran" breadcrumb={[{ label: "Kehadiran" }, { label: "Rekapitulasi" }]} />
    <Box title={`Rekapitulasi (${total})`} noPadding>
      <form className="p-3 flex gap-2 border-b border-[#f4f4f4]">
        <input name="q" defaultValue={q} placeholder="Cari perangkat..." className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs" />
        <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Cari</button>
      </form>
      <LteTable head={<><Th>Nama</Th><Th>Jabatan</Th><Th>Status</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((row) => (<tr key={row.id}><Td>{row.tweb_desa_pamong?.pamong_nama ?? "-"}</Td><Td>{row.tweb_desa_pamong?.ref_jabatan?.nama ?? "-"}</Td><Td>{row.status_kehadiran ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
    <Paging base="/kehadiran/rekapitulasi" page={page} pages={Math.ceil(total / perPage)} q={q} />
  </div>)
}
