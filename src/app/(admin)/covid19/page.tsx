import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default function ModulePage() {
  return (<div>
    <ContentHeader title="Covid-19" breadcrumb={[{ label: "Kependudukan" }, { label: "Covid-19" }]} />
    <Manager />
  </div>)
}
