import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function AreaPage() {
  return (
    <div>
      <ContentHeader title="Area" subtitle="GIS Area" breadcrumb={[{ label: "GIS" }, { label: "Area" }]} />
      <Manager />
    </div>
  )
}
