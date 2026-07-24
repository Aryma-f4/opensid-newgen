import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function PesertaBantuanPage() {
  return (
    <div>
      <ContentHeader title="Peserta Bantuan" breadcrumb={[{ label: "Bantuan" }, { label: "Peserta Bantuan" }]} />
      <Manager />
    </div>
  )
}
