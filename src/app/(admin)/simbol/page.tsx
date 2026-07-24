import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function SimbolPage() {
  return (
    <div>
      <ContentHeader title="Simbol" breadcrumb={[{ label: "GIS" }, { label: "Simbol" }]} />
      <Manager />
    </div>
  )
}
