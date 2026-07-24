import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const [areas, garis, lokasi] = await Promise.all([
    prisma.area.findMany({ where: { path: { not: null } } }),
    prisma.garis.findMany({ where: { path: { not: null } } }),
    prisma.lokasi.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      include: { point: { select: { nama: true, simbol: true } } },
    }),
  ])

  const features: any[] = [
    ...areas.map((a: any) => ({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: a.path ? JSON.parse(a.path) : [] },
      properties: { name: a.nama, type: "area", id: a.id },
    })),
    ...garis.map((g: any) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: g.path ? JSON.parse(g.path) : [] },
      properties: { name: g.nama, type: "garis", id: g.id },
    })),
    ...lokasi.map((l: any) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [parseFloat(l.lng), parseFloat(l.lat)] },
      properties: {
        name: l.nama,
        type: "point",
        id: l.id,
        kategori: l.point?.nama ?? null,
        simbol: l.point?.simbol ?? null,
      },
    })),
  ]

  return NextResponse.json({ type: "FeatureCollection", features })
}
