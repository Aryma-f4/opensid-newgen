import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function PointPage() {
  return (
    <div>
      <ContentHeader title="Point" subtitle="GIS Point" breadcrumb={[{ label: "GIS" }, { label: "Point" }]} />
      <Manager />
    </div>
  )
}
