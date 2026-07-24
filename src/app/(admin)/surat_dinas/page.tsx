import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Surat Dinas" breadcrumb={[{ label: "Sekretariat" }, { label: "Surat Dinas" }]} />
    <Manager />
  </div>)
}
