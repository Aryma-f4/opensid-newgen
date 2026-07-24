import { prisma } from "@/lib/prisma"
import { ContentHeader } from "@/components/admin/Ui"
import SliderManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function SliderPage() {
  const data = await prisma.artikel.findMany({
    where: { slider: true },
    orderBy: { id: "desc" },
    select: {
      id: true,
      judul: true,
      gambar: true,
      isi: true,
      enabled: true,
      slider: true,
      tgl_upload: true,
    },
  })

  return (
    <div>
      <ContentHeader title="Slider" breadcrumb={[{ label: "Website" }, { label: "Slider" }]} />
      <SliderManager data={data} />
    </div>
  )
}
