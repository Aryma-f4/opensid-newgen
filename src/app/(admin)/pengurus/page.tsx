import { requireAdminAccess } from "@/lib/adminAccess"
import { resolvePamongIdentity } from "@/lib/adminDomainScope"
import { prisma } from "@/lib/prisma"

import PengurusManager, {
  type PamongJob,
  type PamongRow,
} from "./PengurusManager"

export const dynamic = "force-dynamic"

const moduleUrl = "pengurus/clear"

type PamongRecord = {
  pamong_id: number
  pamong_nama: string | null
  gelar_depan: string | null
  gelar_belakang: string | null
  pamong_nik: string | null
  pamong_niap: string | null
  pamong_nip: string | null
  pamong_pangkat: string | null
  id_pend: number | null
  jabatan_id: number | null
  pamong_status: number | null
  kehadiran: number
  jabatan: string | null
  resident_nama: string | null
  resident_nik: string | null
}

export default async function PengurusPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, jobRecords, canUpdate, canDelete] = await Promise.all([
    prisma.$queryRaw<PamongRecord[]>`
      SELECT
        p.pamong_id,
        p.pamong_nama,
        p.gelar_depan,
        p.gelar_belakang,
        p.pamong_nik,
        p.pamong_niap,
        p.pamong_nip,
        p.pamong_pangkat,
        p.id_pend,
        p.jabatan_id,
        CAST(p.pamong_status AS UNSIGNED) AS pamong_status,
        p.kehadiran,
        j.nama AS jabatan,
        d.nama AS resident_nama,
        d.nik AS resident_nik
      FROM tweb_desa_pamong p
      LEFT JOIN ref_jabatan j
       ON j.id = p.jabatan_id
       AND j.config_id = p.config_id
      LEFT JOIN tweb_penduduk d
        ON d.id = p.id_pend
       AND d.config_id = p.config_id
      WHERE p.config_id = ${actor.configId}
      ORDER BY COALESCE(p.urut, 2147483647), p.pamong_id
    `,
    prisma.ref_jabatan.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ nama: "asc" }, { id: "asc" }],
      select: { id: true, nama: true },
    }),
    requireAdminAccess(moduleUrl, "u").then(() => true, () => false),
    requireAdminAccess(moduleUrl, "h").then(() => true, () => false),
  ])

  const rows: PamongRow[] = records.map((record) => {
    const identity = resolvePamongIdentity({
      pamongName: record.pamong_nama,
      pamongNik: record.pamong_nik,
      residentName: record.resident_nama,
      residentNik: record.resident_nik,
    })
    return {
      id: Number(record.pamong_id),
      nama: identity.nama,
      gelarDepan: record.gelar_depan ?? "",
      gelarBelakang: record.gelar_belakang ?? "",
      nik: identity.nik,
      niap: record.pamong_niap ?? "",
      nip: record.pamong_nip ?? "",
      pangkat: record.pamong_pangkat ?? "",
      residentBacked: record.id_pend !== null,
      jabatanId: record.jabatan_id === null ? null : Number(record.jabatan_id),
      jabatan: record.jabatan ?? "Belum ditentukan",
      status: Number(record.pamong_status) === 1 ? 1 : 2,
      kehadiran: Number(record.kehadiran) === 1,
    }
  })
  const jobs: PamongJob[] = jobRecords

  return (
    <PengurusManager
      rows={rows}
      jobs={jobs}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}
