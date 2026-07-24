import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function GarisPage() {
  return (
    <div>
      <ContentHeader title="Garis" subtitle="GIS Garis" breadcrumb={[{ label: "GIS" }, { label: "Garis" }]} />
      <Manager />
    </div>
  )
}
