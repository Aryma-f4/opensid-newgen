import { requireAdminAccess } from "@/lib/adminAccess"
import { prisma } from "@/lib/prisma"

import PlanManager, {
  type LocationPoint,
  type LocationRow,
} from "./PlanManager"

export const dynamic = "force-dynamic"

const moduleUrl = "plan"

export default async function PlanPage() {
  const actor = await requireAdminAccess(moduleUrl, "b")
  const [records, pointRecords, canUpdate, canDelete] = await Promise.all([
    prisma.lokasi.findMany({
      where: { config_id: actor.configId },
      orderBy: [{ nama: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nama: true,
        desk: true,
        enabled: true,
        lat: true,
        lng: true,
        ref_point: true,
      },
    }),
    prisma.point.findMany({
      where: {
        tipe: 2,
        OR: [
          { config_id: actor.configId },
          { config_id: null },
        ],
      },
      orderBy: [{ nama: "asc" }, { id: "asc" }],
      select: { id: true, nama: true, enabled: true },
    }),
    requireAdminAccess(moduleUrl, "u").then(() => true, () => false),
    requireAdminAccess(moduleUrl, "h").then(() => true, () => false),
  ])

  const pointNames = new Map(pointRecords.map((point) => [point.id, point.nama]))
  const rows: LocationRow[] = records.map((record) => ({
    id: record.id,
    nama: record.nama,
    desk: record.desk,
    enabled: record.enabled === 1,
    lat: record.lat,
    lng: record.lng,
    refPoint: record.ref_point,
    kategori: record.ref_point
      ? pointNames.get(record.ref_point) ?? "Kategori tidak valid"
      : "Belum ditentukan",
  }))
  const points: LocationPoint[] = pointRecords.map((point) => ({
    id: point.id,
    nama: point.nama,
    enabled: point.enabled === 1,
  }))

  return (
    <PlanManager
      rows={rows}
      points={points}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}
