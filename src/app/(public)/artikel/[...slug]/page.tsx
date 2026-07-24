import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ArtikelDetail({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const slugStr = slug.join("/")

  let artikel
  const id = parseInt(slugStr)
  if (!isNaN(id)) {
    artikel = await prisma.artikel.findFirst({ where: { id }, include: { kategori: true } })
  }
  if (!artikel) {
    artikel = await prisma.artikel.findFirst({
      where: { slug: slug[slug.length - 1] },
      include: { kategori: true },
    })
  }

  if (!artikel) notFound()

  await prisma.artikel.update({ where: { id: artikel.id }, data: { hit: (artikel.hit ?? 0) + 1 } })

  return (
    <>
      <article className="public-card">
        <h1 className="public-title">{artikel.judul}</h1>
        <div className="public-meta">
          <span><i className="fa fa-calendar" /> {artikel.tgl_upload.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
          {artikel.kategori && <span><i className="fa fa-folder-o" /> {artikel.kategori.kategori}</span>}
          <span><i className="fa fa-eye" /> {artikel.hit ?? 0} dibaca</span>
        </div>
        {artikel.gambar && (
          <img src={`/desa/upload/artikel/${artikel.gambar}`} alt={artikel.judul} className="public-cover" />
        )}
        <div className="public-content" dangerouslySetInnerHTML={{ __html: artikel.isi }} />
        {[artikel.gambar1, artikel.gambar2, artikel.gambar3].filter(Boolean).length > 0 && (
          <div className="public-gallery">
            {[artikel.gambar1, artikel.gambar2, artikel.gambar3].filter(Boolean).map((g, i) => (
              <img key={i} src={`/desa/upload/artikel/${g}`} alt="" />
            ))}
          </div>
        )}
      </article>
      <Link href="/" className="public-back"><i className="fa fa-arrow-left" /> Kembali</Link>
    </>
  )
}
