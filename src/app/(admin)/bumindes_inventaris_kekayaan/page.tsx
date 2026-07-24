import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Inventaris Kekayaan" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Inventaris Kekayaan" }]} />
    <Manager />
  </div>)
}
