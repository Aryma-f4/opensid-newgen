import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Penduduk Mutasi" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Penduduk Mutasi" }]} />
    <Manager />
  </div>)
}
