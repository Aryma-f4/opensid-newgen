import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, DetailTable } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function CdesaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.cdesa.findUnique({
    where: { id: parseInt(id) },
    include: {
      cdesa_penduduk: {
        include: { tweb_penduduk: { select: { id: true, nama: true, nik: true } } },
      },
      mutasi_cdesa: { take: 50, orderBy: { id: "desc" } },
    },
  })
  if (!item) notFound()

  const rows: [string, React.ReactNode][] = [
    ["Nomor", <span key="no" className="font-mono">{item.nomor}</span>],
    ["Nama Kepemilikan", item.nama_kepemilikan],
    ["Jenis Pemilik", item.jenis_pemilik ? "Desa" : "Penduduk"],
    ["NIK Pemilik Luar", item.nik_pemilik_luar ?? "-"],
    ["Nama Pemilik Luar", item.nama_pemilik_luar ?? "-"],
    ["Alamat Pemilik Luar", item.alamat_pemilik_luar ?? "-"],
    ["Dibuat", item.created_at?.toLocaleString("id-ID") ?? "-"],
    ["Diubah", item.updated_at?.toLocaleString("id-ID") ?? "-"],
  ]

  return (
    <div>
      <ContentHeader title="Detail C-DESA" breadcrumb={[{ label: "C-DESA", href: "/cdesa" }, { label: item.nomor }]} />

      <Box title={`C-DESA: ${item.nomor}`} noPadding>
        <DetailTable rows={rows} />
      </Box>

      {item.cdesa_penduduk.length > 0 && (
        <div className="mt-4">
          <Box title={`Penduduk Terkait (${item.cdesa_penduduk.length})`} color="success" noPadding>
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover">
                <thead><tr><th>NIK</th><th>Nama</th><th>Aksi</th></tr></thead>
                <tbody>
                  {item.cdesa_penduduk.map((cp) => (
                    <tr key={cp.id}>
                      <td className="font-mono">{cp.tweb_penduduk?.nik ?? "-"}</td>
                      <td>{cp.tweb_penduduk?.nama ?? "-"}</td>
                      <td>
                        {cp.tweb_penduduk ? (
                          <Link href={`/penduduk/${cp.tweb_penduduk.id}`} className="btn btn-primary btn-xs">
                            Detail
                          </Link>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
        </div>
      )}

      {item.mutasi_cdesa.length > 0 && (
        <div className="mt-4">
          <Box title={`Mutasi (${item.mutasi_cdesa.length})`} color="warning" noPadding>
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover">
                <thead><tr><th>Jenis Mutasi</th><th>Tanggal</th><th>Luas</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {item.mutasi_cdesa.map((m) => (
                    <tr key={m.id}>
                      <td>{m.jenis_mutasi === 1 ? "Masuk" : m.jenis_mutasi === 2 ? "Keluar" : m.jenis_mutasi ?? "-"}</td>
                      <td>{m.tanggal_mutasi?.toLocaleDateString("id-ID") ?? "-"}</td>
                      <td>{m.luas?.toString() ?? "-"}</td>
                      <td>{m.keterangan ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Link href="/cdesa" className="text-lte-primary hover:underline text-sm">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
