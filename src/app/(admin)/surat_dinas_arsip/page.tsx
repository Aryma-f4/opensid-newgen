import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Arsip Surat Dinas" breadcrumb={[{ label: "Sekretariat" }, { label: "Arsip Surat Dinas" }]} />
    <Manager />
  </div>)
}
