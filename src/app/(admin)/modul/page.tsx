import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function ModulPage() {
  return (
    <div>
      <ContentHeader title="Manajemen Modul" breadcrumb={[{ label: "Pengaturan" }, { label: "Modul" }]} />
      <Manager />
    </div>
  )
}
