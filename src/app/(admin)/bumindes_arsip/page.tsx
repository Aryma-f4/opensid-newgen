import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Arsip Surat" breadcrumb={[{ label: "Buku Administrasi" }, { label: "Arsip Surat" }]} />
    <Manager />
  </div>)
}
