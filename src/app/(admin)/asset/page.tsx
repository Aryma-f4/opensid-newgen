import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
const perPage = 50
export default async function AssetPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams; const page = parseInt(params.page ?? "1"); const q = params.q?.trim() ?? ""
  const where: any = q ? { nama: { contains: q } } : {}
  const [rows, total] = await Promise.all([
    prisma.tweb_aset.findMany({ where, orderBy: { id_aset: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.tweb_aset.count({ where }),
  ])
  return (<div>
    <ContentHeader title="Aset Desa" breadcrumb={[{ label: "Keuangan" }, { label: "Aset Desa" }]} />
    <Box title={`Aset Desa (${total})`} noPadding>
      <form className="p-3 flex gap-2 border-b border-[#f4f4f4]">
        <input name="q" defaultValue={q} placeholder="Cari aset..." className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs" />
        <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Cari</button>
      </form>
      <LteTable head={<><Th>Nama</Th><Th>Golongan</Th><Th>Bidang</Th><Th>Kelompok</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id_aset}><Td>{r.nama ?? "-"}</Td><Td>{r.golongan ?? "-"}</Td><Td>{r.bidang ?? "-"}</Td><Td>{r.kelompok ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
    <Paging base="/asset" page={page} pages={Math.ceil(total / perPage)} q={q} />
  </div>)
}
