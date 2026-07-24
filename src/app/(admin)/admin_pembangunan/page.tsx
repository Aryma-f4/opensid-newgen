import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function AdminPembangunanPage() {
  return (
    <div>
      <ContentHeader title="Pembangunan" breadcrumb={[{ label: "Pembangunan" }, { label: "Pembangunan" }]} />
      <Manager />
    </div>
  )
}
