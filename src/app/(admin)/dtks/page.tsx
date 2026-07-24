import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function DtksPage() {
  return (
    <div>
      <ContentHeader title="DTKS" subtitle="Data Terpadu Kesejahteraan Sosial" breadcrumb={[{ label: "Kependudukan" }, { label: "DTKS" }]} />
      <Manager />
    </div>
  )
}
