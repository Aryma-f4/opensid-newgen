import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function SinergiProgramPage() {
  return (
    <div>
      <ContentHeader title="Sinergi Program" breadcrumb={[{ label: "Web" }, { label: "Sinergi Program" }]} />
      <Manager />
    </div>
  )
}
