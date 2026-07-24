import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function DptPage() {
  return (
    <div>
      <ContentHeader title="DPT" subtitle="Daftar Pemilih Tetap" breadcrumb={[{ label: "Kependudukan" }, { label: "DPT" }]} />
      <Manager />
    </div>
  )
}
