import Link from "next/link"
import { getArticles, getConfig, getHeadline, getSlideShows } from "@/lib/helpers"

export const dynamic = "force-dynamic"

type Article = Awaited<ReturnType<typeof getArticles>>["articles"][number]

const fallbackImage = "/assets/images/latar_login.jpg"

export default async function Home() {
  const [config, headline, articleResult, slides] = await Promise.all([
    getConfig(),
    getHeadline(),
    getArticles(1, 8),
    getSlideShows(),
  ])

  const articles = articleResult.articles
  const mainArticle = headline ?? articles[0]
  const heroItems = (slides.length ? slides : mainArticle ? [mainArticle] : articles).slice(0, 4)
  const villageName = config?.nama_desa ?? "OpenSID"

  return (
    <>
      <section className="hero-card" aria-label="Sorotan desa">
        <img src={articleImage(heroItems[0]?.gambar)} alt={heroItems[0]?.judul ?? villageName} />
        <div className="hero-overlay" />
        <button className="hero-arrow hero-prev" aria-label="Sebelumnya" type="button"><i className="fa fa-chevron-left" /></button>
        <div className="hero-copy">
          <h1>{villageName}</h1>
          <h2>Desa Maju, Masyarakat Sejahtera</h2>
          <p>{mainArticle ? excerpt(mainArticle.isi, 115) : "Dengan sepenuh hati, ikhlas, tanggap, cepat dan akurat."}</p>
          <Link href={mainArticle ? articleHref(mainArticle) : "/"} className="hero-cta">
            Selengkapnya <i className="fa fa-chevron-right" />
          </Link>
        </div>
        <button className="hero-arrow hero-next" aria-label="Berikutnya" type="button"><i className="fa fa-chevron-right" /></button>
        <div className="hero-dots">
          {(heroItems.length ? heroItems : [null, null, null, null]).slice(0, 4).map((_, index) => <span key={index} className={index === 0 ? "on" : ""} />)}
        </div>
      </section>

      <SectionHeader icon="fa-newspaper-o" title="Berita Utama" actionHref="/artikel" />
      {mainArticle && <FeaturedArticle post={mainArticle} />}

      <SectionHeader icon="fa-clock-o" title="Artikel Terkini" />
      <div className="article-list">
        {articles.filter((article) => article.id !== mainArticle?.id).slice(0, 4).map((article) => <CompactArticle key={article.id} post={article} />)}
      </div>
    </>
  )
}

function SectionHeader({ icon, title, actionHref }: { icon: string; title: string; actionHref?: string }) {
  return (
    <div className="section-head">
      <span className="section-icon"><i className={`fa ${icon}`} /></span>
      <h2>{title}</h2>
      {actionHref && <Link href={actionHref}>Lihat Semua <i className="fa fa-angle-right" /></Link>}
    </div>
  )
}

function FeaturedArticle({ post }: { post: Article }) {
  return (
    <article className="featured">
      <Link href={articleHref(post)} className="featured-image"><img src={articleImage(post.gambar)} alt={post.judul} /></Link>
      <div className="featured-body">
        <span className="pill">{post.kategori?.kategori ?? "Berita Desa"}</span>
        <h3><Link href={articleHref(post)}>{post.judul}</Link></h3>
        <p>{excerpt(post.isi, 210)}</p>
        <div className="meta">
          <span><i className="fa fa-calendar" /> {formatDate(post.tgl_upload)}</span>
          <span><i className="fa fa-user-o" /> Admin</span>
          <span><i className="fa fa-eye" /> {(post.hit ?? 0).toLocaleString("id-ID")}</span>
        </div>
      </div>
    </article>
  )
}

function CompactArticle({ post }: { post: Article }) {
  return (
    <article className="compact-article">
      <img src={articleImage(post.gambar)} alt={post.judul} />
      <div>
        <span>{post.kategori?.kategori ?? "Artikel"}</span>
        <h3><Link href={articleHref(post)}>{post.judul}</Link></h3>
        <p>{excerpt(post.isi, 115)}</p>
      </div>
    </article>
  )
}

function articleHref(post: Article) {
  return `/artikel/${post.slug ?? post.id}`
}

function articleImage(image?: string | null) {
  return image ? `/desa/upload/artikel/${image}` : fallbackImage
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date)
}

function excerpt(html: string, limit: number) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text
}
