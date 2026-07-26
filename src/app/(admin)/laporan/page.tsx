import { prisma } from "@/lib/prisma"
import Manager from "./Manager"
import Link from "next/link"
import { ContentHeader, Box } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"

export default async function Page({ searchParams }: { searchParams: Promise<{ bulan?: string; tahun?: string }> }) {
  const params = await searchParams
  const bulan = params.bulan ?? ""
  const tahun = params.tahun ?? ""
  const data = await prisma.keuangan.findMany({ where: { tahun: { contains: tahun } } as any, orderBy: { id: "desc" as any }, take: 100 })

  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]

  return (<div>
    <ContentHeader title="Laporan" subtitle="Laporan Bulanan" breadcrumb={[{ label: "Laporan" }, { label: "Laporan Bulanan" }]} />
    <div className="flex gap-2 mb-4 flex-wrap">
      <Link href="/laporan" className="btn btn-primary btn-sm"><i className="fa fa-dashboard" /> Semua</Link>
      {months.map((m, i) => (
        <Link key={i} href={`/laporan?bulan=${i + 1}`} className={`btn btn-sm ${bulan === String(i + 1) ? "btn-success" : "btn-default"}`}>{m}</Link>
      ))}
    </div>
    <div className="flex gap-2 mb-4 flex-wrap">
      <Link href="/laporan_apbdes" className="btn btn-info btn-sm"><i className="fa fa-money" /> Laporan APBDes</Link>
      <Link href="/laporan_inventaris" className="btn btn-warning btn-sm"><i className="fa fa-cubes" /> Laporan Inventaris</Link>
      <Link href="/laporan_penduduk" className="btn btn-success btn-sm"><i className="fa fa-users" /> Laporan Penduduk</Link>
      <Link href="/laporan_rentan" className="btn btn-danger btn-sm"><i className="fa fa-child" /> Laporan Kelompok Rentan</Link>
      <Link href="/laporan_keuangan" className="btn btn-default btn-sm"><i className="fa fa-line-chart" /> Laporan Keuangan</Link>
    </div>
    <Box title="Data Laporan" noPadding><Manager initial={data} /></Box>
  </div>)
}
