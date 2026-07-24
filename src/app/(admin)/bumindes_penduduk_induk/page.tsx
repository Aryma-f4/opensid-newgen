import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Penduduk Induk" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Penduduk Induk" }]} />
    <Manager />
  </div>)
}
