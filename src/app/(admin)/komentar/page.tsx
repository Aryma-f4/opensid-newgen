import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function KomentarPage() {
  return (
    <div>
      <ContentHeader title="Komentar" subtitle="Admin Web" breadcrumb={[{ label: "Admin Web" }, { label: "Komentar" }]} />
      <Manager />
    </div>
  )
}
