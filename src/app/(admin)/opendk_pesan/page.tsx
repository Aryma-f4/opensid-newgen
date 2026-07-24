import { ContentHeader } from "@/components/admin/Ui"
import Manager from "./Manager"

export const dynamic = "force-dynamic"

export default function OpenDKPesanPage() {
  return (
    <div>
      <ContentHeader title="OpenDK Pesan" breadcrumb={[{ label: "Notifikasi" }, { label: "OpenDK Pesan" }]} />
      <Manager />
    </div>
  )
}
