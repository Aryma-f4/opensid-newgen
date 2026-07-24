import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ContentHeader } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function PilihSuratPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""

  const where: any = {}
  if (q) {
    where.OR = [
      { nama: { contains: q } },
      { kode_surat: { contains: q } },
    ]
  }

  const formats = await prisma.tweb_surat_format.findMany({
    where,
    orderBy: [{ favorit: "desc" }, { nama: "asc" }],
  })

  return (
    <div>
      <ContentHeader
        title="Pilih Format Surat"
        breadcrumb={[{ label: "Surat", href: "/surat" }, { label: "Pilih Format Surat" }]}
      />

      <div className="mb-4">
        <form method="GET" action="" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau kode surat..."
            className="w-full max-w-md border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-sm focus:border-lte-primary focus:outline-none"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <i className="fa fa-search" /> Cari
          </button>
          {q && (
            <Link href="/surat/pilih" className="btn btn-default btn-sm">
              Reset
            </Link>
          )}
        </form>
      </div>

      <div className="row">
        {formats.length === 0 ? (
          <div className="col-xs-12 text-center py-12 text-gray-400">Tidak ada format surat ditemukan</div>
        ) : (
          formats.map((fmt) => (
            <div key={fmt.id} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
              <div className="box box-primary">
                <div className="box-body text-center" style={{ minHeight: 120 }}>
                  <div className="text-3xl text-lte-primary mb-2">
                    <i className="fa fa-file-text-o" />
                  </div>
                  <div className="font-bold text-sm mb-1">{fmt.nama}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    {fmt.kode_surat ? `[${fmt.kode_surat}]` : ""} {fmt.jenis === 1 ? "Surat" : fmt.jenis === 2 ? "Keterangan" : "Lainnya"}
                  </div>
                  <div className="mt-2">
                    <Link
                      href={`/surat/buat/${fmt.id}`}
                      className="btn btn-success btn-xs"
                    >
                      <i className="fa fa-plus" /> Buat Surat
                    </Link>
                    <Link
                      href={`/surat/${fmt.id}`}
                      className="btn btn-default btn-xs ml-1"
                    >
                      <i className="fa fa-eye" /> Detail
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
