import { prisma } from "@/lib/prisma"
import SuratMasterManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function SuratMasterPage() {
  const surat = await prisma.tweb_surat_format.findMany({
    orderBy: [{ favorit: "desc" }, { nama: "asc" }],
  })

  const data = surat.map((s) => ({
    id: s.id,
    nama: s.nama,
    url_surat: s.url_surat,
    kode_surat: s.kode_surat,
    jenis: s.jenis,
    mandiri: s.mandiri ?? false,
    favorit: s.favorit,
    kunci: s.kunci,
    qr_code: s.qr_code,
    lampiran: s.lampiran,
    template: s.template,
  }))

  return <SuratMasterManager data={data} />
}
