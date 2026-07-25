import { ContentHeader } from "@/components/admin/Ui"
import { requireAdminAccess } from "@/lib/adminAccess"

import QrCodeGenerator from "./QrCodeGenerator"

export const dynamic = "force-dynamic"

const moduleUrl = "qrcode"

export default async function QrCodePage() {
  await requireAdminAccess(moduleUrl, "b")
  const canGenerate = await requireAdminAccess(moduleUrl, "u").then(
    () => true,
    () => false,
  )

  return (
    <div>
      <ContentHeader
        title="QR Code"
        subtitle="Generator lokal tanpa penyimpanan server"
        breadcrumb={[{ label: "Pengaturan" }, { label: "QR Code" }]}
      />
      <QrCodeGenerator canGenerate={canGenerate} />
    </div>
  )
}
