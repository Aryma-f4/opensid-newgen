import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ContentHeader } from "@/components/admin/Ui"
import SuratBuatForm from "./SuratBuatForm"

export const dynamic = "force-dynamic"

export default async function BuatSuratPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const format = await prisma.tweb_surat_format.findUnique({ where: { id: parseInt(id) } })
  if (!format) notFound()

  // Parse form_isian JSON
  let isianFields: { label: string; id: string; type?: string; required?: boolean }[] = []
  try {
    if (format.form_isian) {
      const parsed = JSON.parse(format.form_isian)
      if (Array.isArray(parsed)) {
        isianFields = parsed
      }
    }
  } catch {}

  return (
    <div>
      <ContentHeader
        title={`Buat Surat: ${format.nama}`}
        breadcrumb={[
          { label: "Surat", href: "/surat" },
          { label: "Pilih Format", href: "/surat/pilih" },
          { label: format.nama ?? "" },
        ]}
      />
      <SuratBuatForm format={format} isianFields={isianFields} />
    </div>
  )
}
