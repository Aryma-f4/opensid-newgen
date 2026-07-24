import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Rencana Pembangunan" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Rencana Pembangunan" }]} />
    <Manager />
  </div>)
}
