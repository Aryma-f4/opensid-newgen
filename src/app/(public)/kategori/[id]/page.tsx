import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function KategoriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kategori = await prisma.kategori.findUnique({ where: { id: parseInt(id) } })
  if (!kategori) notFound()

  const artikel = await prisma.artikel.findMany({
    where: { id_kategori: kategori.id, enabled: 1 },
    orderBy: { tgl_upload: "desc" },
  })

  return (
    <section className="public-card">
      <h1 className="public-title">Kategori: {kategori.kategori}</h1>
      <div className="category-page-list">
        {artikel.map((a) => (
          <article key={a.id} className="category-page-item">
            <img src={a.gambar ? `/desa/upload/artikel/${a.gambar}` : "/assets/images/latar_login.jpg"} alt={a.judul} />
            <div>
              <h2>
                <Link href={`/artikel/${a.slug ?? a.id}`}>{a.judul}</Link>
            </h2>
              <p><i className="fa fa-calendar" /> {a.tgl_upload.toLocaleDateString("id-ID")}</p>
            </div>
          </article>
        ))}
        {artikel.length === 0 && <p>Tidak ada artikel.</p>}
      </div>
    </section>
  )
}
