import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function SosmedPage() {
  return (
    <div>
      <ContentHeader title="Media Sosial" breadcrumb={[{ label: "Admin Web" }, { label: "Media Sosial" }]} />
      <Manager />
    </div>
  )
}
