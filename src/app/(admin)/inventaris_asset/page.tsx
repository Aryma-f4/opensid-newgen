import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, LteTable, Th, Td, StatusLabel } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function InventarisAssetPage({ searchParams }: { searchParams: Promise<{ tahun?: string; status?: string }> }) {
  const params = await searchParams
  const tahun = params.tahun?.trim() || ""
  const status = params.status?.trim() || ""

  const where: any = {}
  if (tahun) where.tahun_pengadaan = parseInt(tahun)
  if (status === "active") where.visible = 1
  else if (status === "inactive") where.visible = 0

  const rows = await prisma.inventaris_asset.findMany({ where, orderBy: { id: "desc" } })

  const currentYear = new Date().getFullYear()

  return (
    <div>
      <ContentHeader title="Inventaris Asset" breadcrumb={[{ label: "Inventaris" }, { label: "Asset" }]} />

      <div className="mb-3 bg-white rounded-lg shadow-sm border border-[#f4f4f4] p-3">
        <form method="GET" action="" className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tahun Pengadaan</label>
            <select name="tahun" defaultValue={tahun ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Tahun</option>
              {Array.from({ length: 20 }, (_, i) => currentYear - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select name="status" defaultValue={status ?? ""} className="border border-[#d2d6de] rounded-[3px] px-2 py-1.5 text-sm">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-aktif</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm"><i className="fa fa-search" /> Filter</button>
          {(tahun || status) && (
            <a href="/inventaris_asset" className="text-sm text-gray-500 hover:underline self-center ml-2">Reset</a>
          )}
        </form>
      </div>

      <Box title={`Daftar Asset (${rows.length})`} noPadding>
        <LteTable head={<><Th>Nama Barang</Th><Th>Kode</Th><Th>Register</Th><Th>Jenis</Th><Th>Jumlah</Th><Th>Tahun</Th><Th>Harga</Th><Th>Status</Th></>}>
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.nama_barang}</Td><Td>{row.kode_barang}</Td><Td>{row.register}</Td><Td>{row.jenis}</Td><Td>{row.jumlah}</Td><Td>{row.tahun_pengadaan}</Td><Td>{row.harga.toLocaleString("id-ID")}</Td><Td><StatusLabel ok={row.visible === 1} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>
    </div>
  )
}
