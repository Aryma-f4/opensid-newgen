import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function PengaturanLampiranPage() {
  return (
    <div>
      <ContentHeader title="Pengaturan Lampiran" breadcrumb={[{ label: "Sekretariat" }, { label: "Lampiran" }]} />
      <Manager />
    </div>
  )
}
