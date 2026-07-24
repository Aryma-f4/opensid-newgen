import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Tanah Kas Desa" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Tanah Kas Desa" }]} />
    <Manager />
  </div>)
}
