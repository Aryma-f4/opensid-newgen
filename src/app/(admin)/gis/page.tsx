import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ContentHeader, Box, SmallBox } from "@/components/admin/Ui"
import MapView from "@/components/admin/MapView"

export const dynamic = "force-dynamic"

async function fetchGeojson() {
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

  return { type: "FeatureCollection", features }
}

export default async function GisPage() {
  const [areaCount, garisCount, pointCount, polygonCount, simbolCount, geojson] = await Promise.all([
    prisma.area.count(),
    prisma.garis.count(),
    prisma.point.count(),
    prisma.polygon.count(),
    prisma.gis_simbol.count(),
    fetchGeojson(),
  ])

  return (
    <div>
      <ContentHeader title="GIS" subtitle="Sistem Informasi Geografis" breadcrumb={[{ label: "GIS" }, { label: "Dashboard" }]} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <SmallBox value={areaCount} label="Area" icon="fa-map" color="green" href="/area" />
        <SmallBox value={garisCount} label="Garis" icon="fa-minus" color="yellow" href="/garis" />
        <SmallBox value={pointCount} label="Point" icon="fa-circle-thin" color="aqua" href="/point" />
        <SmallBox value={polygonCount} label="Polygon" icon="fa-square-o" color="blue" href="/polygon" />
        <SmallBox value={simbolCount} label="Simbol" icon="fa-tag" color="purple" href="/simbol" />
      </div>

      <Box title="GIS Layers" color="info">
        <p className="text-sm text-gray-500 mb-3">GIS Layers terintegrasi untuk pemetaan desa. Pilih layer di atas untuk melihat detail.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href="/area" className="btn btn-primary btn-sm"><i className="fa fa-map" /> Area</Link>
          <Link href="/garis" className="btn btn-warning btn-sm"><i className="fa fa-minus" /> Garis</Link>
          <Link href="/point" className="btn btn-info btn-sm"><i className="fa fa-circle-thin" /> Point</Link>
          <Link href="/polygon" className="btn btn-default btn-sm"><i className="fa fa-square-o" /> Polygon</Link>
        </div>
      </Box>

      <Box title="Peta GIS" color="primary">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <MapView geojson={geojson} height={500} />
      </Box>
    </div>
  )
}
