import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, Paging } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
const perPage = 50
export default async function DataSuratPendudukPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams; const page = parseInt(params.page ?? "1"); const q = params.q?.trim() ?? ""
  const where: any = q ? { OR: [{ nama: { contains: q } }, { nik: { contains: q } }] } : {}
  const [rows, total] = await Promise.all([
    prisma.tweb_penduduk.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.tweb_penduduk.count({ where }),
  ])
  return (<div>
    <ContentHeader title="Data Surat Penduduk" breadcrumb={[{ label: "Sekretariat" }, { label: "Data Surat Penduduk" }]} />
    <Box title={`Data Penduduk (${total})`} noPadding>
      <form className="p-3 flex gap-2 border-b border-[#f4f4f4]">
        <input name="q" defaultValue={q} placeholder="Cari nama atau NIK..." className="border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm flex-1 max-w-xs" />
        <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Cari</button>
      </form>
      <LteTable head={<><Th>NIK</Th><Th>Nama</Th><Th>Tempat Lahir</Th><Th>Tanggal Lahir</Th><Th>Alamat</Th></>}>
        {rows.length === 0 ? (<tr><Td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada data</Td></tr>) : rows.map((r: any) => (<tr key={r.id}><Td className="font-mono">{r.nik}</Td><Td>{r.nama}</Td><Td>{r.tempatlahir ?? "-"}</Td><Td>{r.tanggallahir?.toLocaleDateString("id-ID") ?? "-"}</Td><Td>{r.alamat_sekarang ?? "-"}</Td></tr>))}
      </LteTable>
    </Box>
    <Paging base="/data_surat_penduduk" page={page} pages={Math.ceil(total / perPage)} q={q} />
  </div>)
}
