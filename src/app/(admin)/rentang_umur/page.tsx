import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function RentangUmurPage() {
  return (
    <div>
      <ContentHeader title="Rentang Umur" breadcrumb={[{ label: "Kependudukan" }, { label: "Rentang Umur" }]} />
      <Manager />
    </div>
  )
}
