import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function TeksBerjalanPage() {
  return (
    <div>
      <ContentHeader title="Teks Berjalan" breadcrumb={[{ label: "Admin Web" }, { label: "Teks Berjalan" }]} />
      <Manager />
    </div>
  )
}
