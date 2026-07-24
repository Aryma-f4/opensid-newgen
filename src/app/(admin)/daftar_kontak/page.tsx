import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function DaftarKontakPage() {
  return (
    <div>
      <ContentHeader title="Daftar Kontak" breadcrumb={[{ label: "Kontak" }, { label: "Daftar Kontak" }]} />
      <Manager />
    </div>
  )
}
