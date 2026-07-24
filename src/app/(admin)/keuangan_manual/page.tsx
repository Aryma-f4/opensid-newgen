import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function KeuanganManualPage() {
  return (
    <div>
      <ContentHeader title="Keuangan Manual" breadcrumb={[{ label: "Keuangan" }, { label: "Keuangan Manual" }]} />
      <Manager />
    </div>
  )
}
