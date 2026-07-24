import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function PengaduanAdminPage() {
  return (
    <div>
      <ContentHeader title="Pengaduan" breadcrumb={[{ label: "Layanan" }, { label: "Pengaduan" }]} />
      <Manager />
    </div>
  )
}
