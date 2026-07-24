import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function KlasifikasiPage() {
  return (
    <div>
      <ContentHeader title="Klasifikasi Surat" breadcrumb={[{ label: "Sekretariat" }, { label: "Klasifikasi" }]} />
      <Manager />
    </div>
  )
}
