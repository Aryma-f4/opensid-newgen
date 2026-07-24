import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function PendapatPage() {
  return (
    <div>
      <ContentHeader title="Pendapat" subtitle="Opini Publik" breadcrumb={[{ label: "Layanan" }, { label: "Pendapat" }]} />
      <Manager />
    </div>
  )
}
