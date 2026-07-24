import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
const perPage = 50
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; tahun?: string }> }) {
  const params = await searchParams; const page = parseInt(params.page ?? "1"); const tahun = params.tahun ?? ""
  const where = tahun ? { tahun: { contains: tahun } } : {}
  const tahunList = await prisma.keuangan.findMany({
    distinct: ["tahun"],
    orderBy: { tahun: "desc" },
    select: { tahun: true },
  })
  const [rows, total] = await Promise.all([
    prisma.keuangan.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.keuangan.count({ where }),
  ])
  return (<div>
    <ContentHeader title="Laporan Keuangan" breadcrumb={[{ label: "Keuangan" }, { label: "Laporan Keuangan" }]} />
    <Box title={`Laporan Keuangan (${total})`} noPadding>
      <form className="p-3 flex gap-2 border-b border-[#f4f4f4]">
        <select name="tahun" defaultValue={tahun} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
          <option value="">Semua Tahun</option>
          {tahunList.map((item) => <option key={item.tahun} value={item.tahun}>{item.tahun}</option>)}
        </select>
        <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
      </form>
      <LteTable head={<><Th>Tahun</Th><Th>Anggaran</Th><Th>Realisasi</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((row) => (<tr key={row.id}><Td>{row.tahun}</Td><Td>{Number(row.anggaran).toLocaleString("id-ID")}</Td><Td>{Number(row.realisasi).toLocaleString("id-ID")}</Td></tr>))}
      </LteTable>
    </Box>
    <Paging base="/laporan_keuangan" page={page} pages={Math.ceil(total / perPage)} extraParams={{ tahun }} />
  </div>)
}
