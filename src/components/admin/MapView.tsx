"use client"

import { useEffect, useRef } from "react"

export default function MapView({ geojson, height = 400 }: { geojson?: any; height?: number }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  useEffect(() => {
    const el = mapRef.current
    if (!el || mapInstance.current) return

    const initMap = async () => {
      const L = await import("leaflet")
      leafletRef.current = L

      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(el).setView([-1.5, 118], 5)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)
      mapInstance.current = map

      return map
    }

    initMap()
  }, [])

  useEffect(() => {
    if (!mapInstance.current || !geojson || !leafletRef.current) return
    const map = mapInstance.current
    const L = leafletRef.current

    // Remove existing layers except the tile layer
    map.eachLayer((layer: any) => {
      if (layer._url) return // keep tile layer
      map.removeLayer(layer)
    })

    try {
      const layer = L.geoJSON(geojson)
      layer.addTo(map)
      map.fitBounds(layer.getBounds(), { padding: [20, 20] })
    } catch {
      // invalid geojson, skip
    }
  }, [geojson])

  return <div ref={mapRef} style={{ width: "100%", height }} className="rounded-lg border border-gray-200" />
}
