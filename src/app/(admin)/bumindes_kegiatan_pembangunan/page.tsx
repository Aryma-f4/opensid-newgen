import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Kegiatan Pembangunan" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Kegiatan Pembangunan" }]} />
    <Manager />
  </div>)
}
