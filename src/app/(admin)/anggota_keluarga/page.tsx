import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function AnggotaKeluargaPage() {
  return (
    <div>
      <ContentHeader title="Anggota Keluarga" breadcrumb={[{ label: "Kependudukan" }, { label: "Anggota Keluarga" }]} />
      <Manager />
    </div>
  )
}
