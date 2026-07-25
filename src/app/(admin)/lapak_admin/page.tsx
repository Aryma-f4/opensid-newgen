import {
  Box,
  ContentHeader,
  LteTable,
  StatusLabel,
  Td,
  Th,
} from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const moduleUrl = "lapak_admin"

export default async function LapakAdminPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [sellerRecords, productRecords, categoryRecords] = await Promise.all([
    prisma.pelapak.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ status: "desc" }, { id: "desc" }],
      select: {
        id: true,
        id_pend: true,
        telepon: true,
        lat: true,
        lng: true,
        status: true,
      },
    }),
    prisma.produk.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ status: "desc" }, { id: "desc" }],
      select: {
        id: true,
        id_pelapak: true,
        id_produk_kategori: true,
        nama: true,
        harga: true,
        satuan: true,
        status: true,
      },
    }),
    prisma.produk_kategori.findMany({
      where: { config_id: actor.configId },
      select: { id: true, kategori: true },
    }),
  ])

  const residentIds = sellerRecords
    .map((seller) => seller.id_pend)
    .filter((id): id is number => id !== null)
  const residentRecords = residentIds.length === 0
    ? []
    : await prisma.tweb_penduduk.findMany({
      where: {
        config_id: actor.configId,
        id: { in: residentIds },
      },
      select: { id: true, nama: true, nik: true },
    })

  const residents = new Map(residentRecords.map((resident) => [resident.id, resident]))
  const categories = new Map(categoryRecords.map((category) => [
    category.id,
    category.kategori ?? "Tanpa kategori",
  ]))
  const sellers = new Map(sellerRecords.map((seller) => [
    seller.id,
    seller.id_pend ? residents.get(seller.id_pend)?.nama ?? "Penduduk tidak ditemukan" : "Tanpa penduduk",
  ]))
  const productCount = new Map<number, number>()
  for (const product of productRecords) {
    if (product.id_pelapak === null) continue
    productCount.set(product.id_pelapak, (productCount.get(product.id_pelapak) ?? 0) + 1)
  }

  return (
    <div>
      <ContentHeader
        title="Administrator Lapak"
        subtitle="Ringkasan pelapak dan produk tenant"
        breadcrumb={[{ label: "Lapak" }, { label: "Administrator" }]}
      />

      <Box
        title={`Produk (${productRecords.length})`}
        tools={
          <span className="btn btn-default btn-xs disabled" aria-disabled="true">
            Pengelolaan produk menunggu port tenant-safe
          </span>
        }
        noPadding
      >
        <LteTable
          head={
            <>
              <Th>Nama Produk</Th>
              <Th>Kategori</Th>
              <Th>Pelapak</Th>
              <Th>Harga</Th>
              <Th className="w-24">Status</Th>
            </>
          }
        >
          {productRecords.length === 0 ? (
            <tr>
              <Td colSpan={5} className="py-8 text-center text-gray-400">Belum ada produk</Td>
            </tr>
          ) : productRecords.map((product) => (
            <tr key={product.id}>
              <Td>{product.nama ?? "-"}</Td>
              <Td>{product.id_produk_kategori ? categories.get(product.id_produk_kategori) ?? "Kategori tidak ditemukan" : "-"}</Td>
              <Td>{product.id_pelapak ? sellers.get(product.id_pelapak) ?? "Pelapak tidak ditemukan" : "-"}</Td>
              <Td>
                Rp {(product.harga ?? 0).toLocaleString("id-ID")}
                {product.satuan ? ` / ${product.satuan}` : ""}
              </Td>
              <Td><StatusLabel ok={product.status} /></Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <Box
        title={`Pelapak (${sellerRecords.length})`}
        tools={
          <span className="btn btn-default btn-xs disabled" aria-disabled="true">
            Pengelolaan pelapak menunggu port tenant-safe
          </span>
        }
        noPadding
      >
        <LteTable
          head={
            <>
              <Th>Nama</Th>
              <Th>NIK</Th>
              <Th>Telepon</Th>
              <Th>Produk</Th>
              <Th>Koordinat</Th>
              <Th className="w-24">Status</Th>
            </>
          }
        >
          {sellerRecords.length === 0 ? (
            <tr>
              <Td colSpan={6} className="py-8 text-center text-gray-400">Belum ada pelapak</Td>
            </tr>
          ) : sellerRecords.map((seller) => {
            const resident = seller.id_pend ? residents.get(seller.id_pend) : null
            return (
              <tr key={seller.id}>
                <Td>{resident?.nama ?? "Penduduk tidak ditemukan"}</Td>
                <Td>{resident?.nik ?? "-"}</Td>
                <Td>{seller.telepon ?? "-"}</Td>
                <Td>{productCount.get(seller.id) ?? 0}</Td>
                <Td>{seller.lat && seller.lng ? `${seller.lat}, ${seller.lng}` : "-"}</Td>
                <Td><StatusLabel ok={seller.status} /></Td>
              </tr>
            )
          })}
        </LteTable>
      </Box>

      <Box color="info" title="Cakupan Port">
        <p className="mb-0 text-sm text-gray-600">
          Ringkasan ini membaca data pelapak, penduduk, kategori, dan produk hanya dari
          tenant aktif. Form produk, kategori, foto, serta peta pelapak tetap menggunakan
          port tenant-safe berikutnya. Tautan ke halaman lama sengaja tidak ditampilkan
          karena halaman tersebut belum menerapkan isolasi tenant.
        </p>
      </Box>
    </div>
  )
}
