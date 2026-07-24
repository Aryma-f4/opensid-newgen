import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Permohonan Surat" breadcrumb={[{ label: "Sekretariat" }, { label: "Permohonan Surat" }]} />
    <Manager />
  </div>)
}
