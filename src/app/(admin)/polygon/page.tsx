import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function PolygonPage() {
  return (
    <div>
      <ContentHeader title="Polygon" subtitle="GIS Polygon" breadcrumb={[{ label: "GIS" }, { label: "Polygon" }]} />
      <Manager />
    </div>
  )
}
