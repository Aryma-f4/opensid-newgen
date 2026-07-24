import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function NotifikasiPage() {
  return (
    <div>
      <ContentHeader title="Notifikasi" breadcrumb={[{ label: "Layanan Mandiri" }, { label: "Notifikasi" }]} />
      <Manager />
    </div>
  )
}
