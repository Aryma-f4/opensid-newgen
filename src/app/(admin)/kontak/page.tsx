import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function KontakPage() {
  return (
    <div>
      <ContentHeader title="Kontak" breadcrumb={[{ label: "Notifikasi" }, { label: "Kontak" }]} />
      <Manager />
    </div>
  )
}
