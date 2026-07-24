import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function GrupPage() {
  return (
    <div>
      <ContentHeader title="Grup Pengguna" breadcrumb={[{ label: "Pengaturan" }, { label: "Grup Pengguna" }]} />
      <Manager />
    </div>
  )
}
