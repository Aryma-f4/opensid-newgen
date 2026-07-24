import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function BukuTamuPage() {
  return (
    <div>
      <ContentHeader title="Buku Tamu" breadcrumb={[{ label: "Modul" }, { label: "Buku Tamu" }]} />
      <Manager />
    </div>
  )
}
