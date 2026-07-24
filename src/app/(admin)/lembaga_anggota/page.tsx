import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function LembagaAnggotaPage() {
  return (
    <div>
      <ContentHeader title="Lembaga Anggota" breadcrumb={[{ label: "Lembaga" }, { label: "Lembaga Anggota" }]} />
      <Manager />
    </div>
  )
}
