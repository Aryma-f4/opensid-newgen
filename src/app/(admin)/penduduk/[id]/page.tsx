import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContentHeader, Box, LteTable, Th, Td, Btn } from "@/components/admin/Ui"

export const dynamic = "force-dynamic"

export default async function PendudukDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await prisma.tweb_penduduk.findUnique({
    where: { id: parseInt(id) },
    include: {
      tweb_keluarga_tweb_penduduk_id_kkTotweb_keluarga: {
        select: { id: true, no_kk: true, kelas_sosial: true, tgl_daftar: true },
      },
    },
  })
  if (!p) notFound()

  const [sexRef, agamaRef, pendidikanRef, pekerjaanRef, kawinRef, wargaRef, clusterRef, pendidikanSedangRef, cacatRef, sakitMenahunRef] = await Promise.all([
    prisma.tweb_penduduk_sex.findMany(),
    prisma.tweb_penduduk_agama.findMany(),
    prisma.tweb_penduduk_pendidikan_kk.findMany(),
    prisma.tweb_penduduk_pekerjaan.findMany(),
    prisma.tweb_penduduk_kawin.findMany(),
    prisma.tweb_penduduk_warganegara.findMany(),
    prisma.tweb_wil_clusterdesa.findMany(),
    prisma.tweb_penduduk_pendidikan.findMany(),
    prisma.tweb_cacat.findMany(),
    prisma.tweb_sakit_menahun.findMany(),
  ])

  const sexMap = new Map(sexRef.map((s) => [s.id, s.nama ?? "-"]))
  const agamaMap = new Map(agamaRef.map((a) => [a.id, a.nama ?? "-"]))
  const pendidikanMap = new Map(pendidikanRef.map((p2) => [p2.id, p2.nama ?? "-"]))
  const pekerjaanMap = new Map(pekerjaanRef.map((pk) => [pk.id, pk.nama ?? "-"]))
  const kawinMap = new Map(kawinRef.map((k) => [k.id, k.nama ?? "-"]))
  const wargaMap = new Map(wargaRef.map((w) => [w.id, w.nama ?? "-"]))
  const clusterMap = new Map(clusterRef.map((c) => [c.id, `${c.dusun} RT ${c.rt} RW ${c.rw}`]))
  const pendidikanSedangMap = new Map(pendidikanSedangRef.map((ps) => [ps.id, ps.nama ?? "-"]))
  const cacatMap = new Map(cacatRef.map((c) => [c.id, c.nama ?? "-"]))
  const sakitMenahunMap = new Map(sakitMenahunRef.map((sm) => [sm.id, sm.nama ?? "-"]))

  const kk = p.tweb_keluarga_tweb_penduduk_id_kkTotweb_keluarga

  const rows: [string, string | number | null | undefined | React.ReactNode][] = [
    ["NIK", p.nik],
    ["Nama", p.nama],
    ["Jenis Kelamin", sexMap.get(p.sex) ?? "-"],
    ["Tempat Lahir", p.tempatlahir],
    ["Tanggal Lahir", p.tanggallahir?.toLocaleDateString("id-ID")],
    ["Agama", agamaMap.get(p.agama_id) ?? "-"],
    ["Pendidikan KK", pendidikanMap.get(p.pendidikan_kk_id) ?? "-"],
    ["Pendidikan Sedang", pendidikanSedangMap.get(p.pendidikan_sedang_id ?? 0) ?? "-"],
    ["Pekerjaan", pekerjaanMap.get(p.pekerjaan_id) ?? "-"],
    ["Status Kawin", kawinMap.get(p.status_kawin) ?? "-"],
    ["Kewarganegaraan", wargaMap.get(p.warganegara_id) ?? "-"],
    ["Golongan Darah", p.golongan_darah_id?.toString() ?? "-"],
    ["Cacat", cacatMap.get(p.cacat_id ?? 0) ?? "-"],
    ["Sakit Menahun", sakitMenahunMap.get(p.sakit_menahun_id ?? 0) ?? "-"],
    ["No. KK", kk ? (
      <Link key="kk" href={`/keluarga/${kk.id}`} className="font-mono text-lte-primary hover:underline">
        {kk.no_kk ?? "-"}
      </Link>
    ) : "-"],
    ["Kelas Sosial KK", kk?.kelas_sosial?.toString() ?? "-"],
    ["Tanggal Daftar KK", kk?.tgl_daftar?.toLocaleDateString("id-ID") ?? "-"],
    ["Dusun/Cluster", clusterMap.get(p.id_cluster ?? 0) ?? "-"],
    ["Alamat Sekarang", p.alamat_sekarang],
    ["Alamat Sebelumnya", p.alamat_sebelumnya],
    ["Telepon", p.telepon],
    ["Email", p.email],
    ["Nama Ayah", p.nama_ayah],
    ["Nama Ibu", p.nama_ibu],
    ["Akta Lahir", p.akta_lahir],
    ["Status Dasar", p.status_dasar === 1 ? "Hidup" : "Mati"],
    ["Hamil", p.hamil ? "Ya" : "Tidak"],
    ["Akta Perkawinan", p.akta_perkawinan ?? "-"],
    ["Tanggal Perkawinan", p.tanggalperkawinan?.toLocaleDateString("id-ID") ?? "-"],
    ["Akta Perceraian", p.akta_perceraian ?? "-"],
    ["Tanggal Perceraian", p.tanggalperceraian?.toLocaleDateString("id-ID") ?? "-"],
    ["Catatan", p.ket],
    ["Dibuat", p.created_at?.toLocaleString("id-ID")],
    ["Diubah", p.updated_at?.toLocaleString("id-ID")],
  ]

  return (
    <div>
      <ContentHeader title="Detail Penduduk" breadcrumb={[{ label: "Kependudukan", href: "/penduduk" }, { label: p.nama }]} />

      <Box title={p.nama} noPadding>
        <div className="p-3 flex items-start gap-4 border-b border-[#f4f4f4]">
          <div className="w-16 h-16 rounded-full bg-[#d2d6de] flex items-center justify-center text-xl font-bold text-[#444]">
            {p.nama?.[0] ?? "U"}
          </div>
          <div>
            <div className="text-lg font-semibold">{p.nama}</div>
            <div className="text-sm text-gray-500">{p.nik}</div>
          </div>
        </div>

        <LteTable
          head={
            <>
              <Th>Field</Th>
              <Th>Nilai</Th>
            </>
          }
        >
          {rows.map(([label, value]) => (
            <tr key={label}>
              <Td className="w-56 text-gray-500">{label}</Td>
              <Td>{String(value ?? "-")}</Td>
            </tr>
          ))}
        </LteTable>
      </Box>

      <div className="mt-3 flex gap-2 flex-wrap">
        <Link href={`/keluarga${kk ? `/${kk.id}` : ""}`} className="btn btn-info btn-sm">
          <i className="fa fa-users mr-1" /> Lihat KK
        </Link>
        <Link href="/penduduk" className="text-lte-primary hover:underline text-sm self-center">
          <i className="fa fa-arrow-left mr-1" /> Kembali ke daftar
        </Link>
      </div>
    </div>
  )
}
