import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function CdesaPage() {
  return (
    <div>
      <ContentHeader title="C-DESA" breadcrumb={[{ label: "Keuangan" }, { label: "C-DESA" }]} />
      <Manager />
    </div>
  )
}
