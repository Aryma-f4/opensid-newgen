import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function KelompokAnggotaPage() {
  return (
    <div>
      <ContentHeader title="Kelompok Anggota" breadcrumb={[{ label: "Kelompok" }, { label: "Kelompok Anggota" }]} />
      <Manager />
    </div>
  )
}
