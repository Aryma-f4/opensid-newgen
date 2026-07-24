import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Kader Pemberdayaan" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Kader Pemberdayaan" }]} />
    <Manager />
  </div>)
}
