import { prisma } from "@/lib/prisma"
import Manager from "./Manager"
import Link from "next/link"
import { ContentHeader, Box, SmallBox } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"

export default async function Page() {
  const data = await prisma.kehadiran_perangkat_desa.findMany({ orderBy: { id: "desc" as any }, take: 100 })
  const [jamKerja, hariLibur, pengaduan, izin, alasan] = await Promise.all([
    prisma.kehadiran_jam_kerja.count(),
    prisma.kehadiran_hari_libur.count(),
    prisma.kehadiran_pengaduan.count(),
    prisma.kehadiran_pengajuan_izin.count(),
    prisma.kehadiran_alasan_keluar.count(),
  ])

  return (
    <div>
      <ContentHeader title="Kehadiran" breadcrumb={[{ label: "Modul" }, { label: "Kehadiran" }]} />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-4">
        <SmallBox value={jamKerja} label="Jam Kerja" icon="fa-clock-o" color="blue" href="/kehadiran/jam_kerja" />
        <SmallBox value={hariLibur} label="Hari Libur" icon="fa-calendar" color="green" href="/kehadiran/hari_libur" />
        <SmallBox value={pengaduan} label="Pengaduan" icon="fa-bullhorn" color="yellow" href="/kehadiran/pengaduan" />
        <SmallBox value={izin} label="Izin" icon="fa-file-text" color="purple" href="/kehadiran/pengajuan_izin" />
        <SmallBox value={alasan} label="Alasan Keluar" icon="fa-sign-out" color="red" href="/kehadiran/alasan_keluar" />
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Link href="/kehadiran/jam_kerja" className="btn btn-info btn-sm"><i className="fa fa-clock-o" /> Jam Kerja</Link>
        <Link href="/kehadiran/hari_libur" className="btn btn-success btn-sm"><i className="fa fa-calendar" /> Hari Libur</Link>
        <Link href="/kehadiran/rekapitulasi" className="btn btn-primary btn-sm"><i className="fa fa-bar-chart" /> Rekapitulasi</Link>
        <Link href="/kehadiran/pengaduan" className="btn btn-warning btn-sm"><i className="fa fa-bullhorn" /> Pengaduan</Link>
        <Link href="/kehadiran/pengajuan_izin" className="btn btn-default btn-sm"><i className="fa fa-file-text" /> Izin</Link>
        <Link href="/kehadiran/persetujuan_izin" className="btn btn-info btn-sm"><i className="fa fa-check" /> Persetujuan Izin</Link>
        <Link href="/kehadiran/alasan_keluar" className="btn btn-danger btn-sm"><i className="fa fa-sign-out" /> Alasan Keluar</Link>
      </div>
      <Box title={`Perangkat Desa (${data.length})`} noPadding>
        <Manager initial={data} />
      </Box>
    </div>
  )
}
