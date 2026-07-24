import Link from "next/link"
import type { ReactNode } from "react"
import {
  getCategories,
  getConfig,
  getMenu,
  getPamong,
  getRunningText,
  getSocialMedia,
  getStatistics,
} from "@/lib/helpers"
import PublicNav from "./PublicNav"

type MenuItem = Awaited<ReturnType<typeof getMenu>>[number]

const defaultAvatar = "/themes/natra/assets/images/noimage.png"
export default async function PublicSiteShell({ children }: { children: ReactNode }) {
  const [config, menu, categories, pamong, runningText, stats, sosmed] = await Promise.all([
    getConfig(),
    getMenu(),
    getCategories(),
    getPamong(),
    getRunningText(),
    getStatistics(),
    getSocialMedia(),
  ])

  const navItems = menu.filter((item) => item.nama.toLowerCase() !== "beranda")
  const villageName = config?.nama_desa ?? "OpenSID"
  const siteTitle = `Website Resmi Kelurahan ${villageName}`.toUpperCase()
  const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date())
  const maxPopulation = Math.max(stats.lakiLaki, stats.perempuan, stats.totalPenduduk, 1)

  return (
    <>
      <link rel="stylesheet" href="/assets/bootstrap/css/font-awesome.min.css" />
      <main className="osid-home">
        <div className="osid-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              <span className="brand-logo"><img src={logoImage(config?.logo)} alt={villageName} /></span>
              <span>
                <strong>{siteTitle}</strong>
                <small>Kec. {config?.nama_kecamatan ?? "-"} Kab. {config?.nama_kabupaten ?? "-"} Prov. {config?.nama_propinsi ?? "-"}</small>
              </span>
            </Link>
            <form className="search" action="/" method="get">
              <i className="fa fa-search" />
              <input name="cari" placeholder="Cari artikel, berita, informasi..." />
              <button aria-label="Cari" type="submit"><i className="fa fa-search" /></button>
            </form>
          </header>

          <PublicNav items={navItems} />

          {runningText.length > 0 && (
            <section className="ticker" aria-label="Informasi berjalan">
              <i className="fa fa-bullhorn" />
              <div className="ticker-track"><span>{runningText.map((item) => item.teks).join("   •   ")}</span></div>
            </section>
          )}

          <div className="content-grid">
            <section className="main-column">{children}</section>
            <aside className="side-column">
              <section className="info-card date-card">
                <span className="date-icon"><i className="fa fa-calendar" /></span>
                <span><strong>{today}</strong><small><i className="fa fa-clock-o" /> {time}</small></span>
              </section>
              <Widget icon="fa-lock" title="Masuk">
                <div className="login-actions">
                  <Link href="/layanan-mandiri" className="login-btn self"><i className="fa fa-user" />Layanan Mandiri</Link>
                  <Link href="/siteman" className="login-btn admin"><i className="fa fa-shield" />Admin</Link>
                </div>
              </Widget>
              <Widget icon="fa-bookmark" title="Menu Kategori">
                <ul className="category-list">
                  {categories.slice(0, 6).map((cat) => (
                    <li key={cat.id}><Link href={`/kategori/${cat.id}`}><i className="fa fa-angle-right" /><span>{cat.kategori}</span></Link></li>
                  ))}
                </ul>
              </Widget>
              <Widget icon="fa-bar-chart" title="Statistik Penduduk">
                <div className="chart-title"><span>Jumlah Penduduk</span><i className="fa fa-bars" /></div>
                <div className="bar-chart">
                  <PopulationBar label="Laki-laki" value={stats.lakiLaki} max={maxPopulation} className="male" />
                  <PopulationBar label="Perempuan" value={stats.perempuan} max={maxPopulation} className="female" />
                  <PopulationBar label="Total" value={stats.totalPenduduk} max={maxPopulation} className="total" />
                </div>
                <div className="stat-total"><span>Total Penduduk</span><strong>{stats.totalPenduduk.toLocaleString("id-ID")} Jiwa</strong></div>
              </Widget>
              <Widget icon="fa-users" title="Aparatur Desa">
                <div className="people-list">
                  {pamong.slice(0, 4).map((person) => (
                    <div key={person.pamong_id} className="person">
                      <img src={pamongImage(person.foto)} alt={person.pamong_nama ?? ""} />
                      <span><strong>{person.pamong_nama}</strong><small>{person.ref_jabatan?.nama ?? "-"}</small></span>
                    </div>
                  ))}
                </div>
              </Widget>
            </aside>
          </div>

          <footer className="home-footer">
            <div>
              <strong>{siteTitle}</strong>
              <p>{config?.alamat_kantor ?? "-"} · Kec. {config?.nama_kecamatan ?? "-"} · Kab. {config?.nama_kabupaten ?? "-"}</p>
            </div>
            <div className="socials">
              {sosmed.slice(0, 5).map((item) => item.link ? <a key={item.id} href={item.link} target="_blank" rel="noreferrer" aria-label={item.nama}><i className="fa fa-share-alt" /></a> : null)}
            </div>
          </footer>
        </div>
      </main>
      <style>{publicCss}</style>
    </>
  )
}

function Widget({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return <section className="widget"><h2><i className={`fa ${icon}`} /> {title}</h2>{children}</section>
}

function PopulationBar({ label, value, max, className }: { label: string; value: number; max: number; className: string }) {
  const height = Math.max(10, Math.round((value / max) * 130))
  return <div className="bar-item"><span className="bar-value">{compactNumber(value)}</span><span className={`bar ${className}`} style={{ height }} /><small>{label}</small></div>
}

function hrefFor(item: MenuItem) {
  const raw = item.link ?? "#"
  if (!raw || raw === "#") return "#"
  if (item.link_tipe || raw.startsWith("http") || raw.startsWith("/")) return raw
  return `/${raw}`
}

function logoImage(image?: string | null) {
  return image ? `/desa/logo/${image}` : defaultAvatar
}

function pamongImage(image?: string | null) {
  return image ? `/desa/upload/pamong/${image}` : defaultAvatar
}

function compactNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}k`
  return value.toLocaleString("id-ID")
}

const publicCss = `
:root{--osid-green:#08703f;--osid-green-dark:#00543c;--osid-green-soft:#e7f5ec;--osid-text:#182033;--osid-muted:#667085;--osid-line:#dde4ea;--osid-shadow:0 16px 36px rgba(25,40,70,.10)}
body{background:#f6f8f7!important}.osid-home{min-height:100vh;color:var(--osid-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at top left,rgba(19,133,75,.08),transparent 34rem),linear-gradient(180deg,#fbfdfc 0%,#f4f7f5 100%)}.osid-shell{width:min(1720px,calc(100% - 80px));margin:0 auto;padding:28px 0 18px}
.site-header{display:flex;align-items:center;justify-content:space-between;gap:32px;margin-bottom:22px}.brand{display:inline-flex;align-items:center;gap:16px;color:var(--osid-text);text-decoration:none;min-width:0}.brand:hover,.brand:focus{color:var(--osid-text);text-decoration:none}.brand-logo{width:58px;height:58px;display:grid;place-items:center;flex:0 0 auto}.brand-logo img{max-width:58px;max-height:58px;object-fit:contain}.brand strong{display:block;font-size:25px;line-height:1.05;letter-spacing:0}.brand small{display:block;margin-top:8px;color:#687083;font-size:15px;font-weight:700;text-transform:uppercase}
.search{width:min(510px,42vw);height:58px;display:flex;align-items:center;gap:14px;padding-left:20px;border:1px solid #d5dce4;border-radius:10px;background:#fff;box-shadow:0 10px 26px rgba(30,50,80,.04)}.search>i{color:#697386;font-size:20px}.search input{min-width:0;flex:1;height:100%;border:0;outline:0;color:var(--osid-text);font-size:16px;background:transparent}.search button{width:94px;height:58px;border:0;border-radius:0 10px 10px 0;background:linear-gradient(135deg,#138943,#00633f);color:#fff;font-size:24px}
.main-nav{position:sticky;top:0;z-index:50;margin-bottom:20px;overflow:visible;border-radius:13px;background:linear-gradient(135deg,#18864d,#005a42);box-shadow:0 14px 32px rgba(0,96,62,.22)}
.main-nav:before{content:"";position:absolute;inset:0;border-radius:13px;background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.13) 22%,transparent 44%);transform:translateX(-120%);animation:navSweep 7s ease-in-out infinite;pointer-events:none}
.main-nav li{position:relative}.nav-link{position:relative;height:56px;display:inline-flex;align-items:center;gap:8px;padding:0 12px;color:#fff;font-size:13px;font-weight:800;text-transform:uppercase;white-space:nowrap;border-radius:9px;text-decoration:none;transition:transform .22s ease,background-color .22s ease,box-shadow .22s ease,color .22s ease}.nav-link:after{content:"";position:absolute;left:13px;right:13px;bottom:8px;height:3px;border-radius:999px;background:#b8f3ce;opacity:0;transform:scaleX(.35);transform-origin:center;transition:opacity .22s ease,transform .22s ease}.nav-link:hover,.nav-link:focus,.nav-link.active{color:#fff;text-decoration:none;background:rgba(0,66,42,.30);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 10px 20px rgba(0,55,38,.18);transform:translateY(-2px)}.nav-link:hover:after,.nav-link:focus:after,.nav-link.active:after{opacity:1;transform:scaleX(1)}.nav-link i:not(.nav-caret){font-size:18px;transition:transform .22s ease}.nav-link:hover i:not(.nav-caret),.nav-link:focus i:not(.nav-caret){transform:translateY(-1px) scale(1.08)}.nav-caret{opacity:.8;transition:transform .22s ease}.has-dropdown:hover .nav-caret,.has-dropdown:focus-within .nav-caret{transform:rotate(180deg)}
.dropdown-panel{position:absolute;top:calc(100% + 10px);left:0;display:block;min-width:260px;padding:8px;border:1px solid rgba(0,101,67,.12);border-radius:12px;background:rgba(255,255,255,.98);box-shadow:var(--osid-shadow);opacity:0;visibility:hidden;transform:translateY(10px) scale(.98);transform-origin:top left;transition:opacity .18s ease,visibility .18s ease,transform .18s ease;backdrop-filter:blur(12px)}.has-dropdown:hover>.dropdown-panel,.has-dropdown:focus-within>.dropdown-panel{opacity:1;visibility:visible;transform:translateY(0) scale(1)}.dropdown-panel:before{content:"";position:absolute;top:-7px;left:28px;width:14px;height:14px;background:#fff;border-left:1px solid rgba(0,101,67,.10);border-top:1px solid rgba(0,101,67,.10);transform:rotate(45deg)}.dropdown-panel a{position:relative;display:block;padding:11px 13px 11px 30px;border-radius:8px;color:var(--osid-text);font-weight:750;text-decoration:none;transition:background-color .18s ease,color .18s ease,transform .18s ease}.dropdown-panel a:before{content:"";position:absolute;left:12px;top:50%;width:7px;height:7px;border-radius:999px;background:#b9d8c5;transform:translateY(-50%);transition:background-color .18s ease,transform .18s ease}.dropdown-panel a:hover,.dropdown-panel a:focus{color:var(--osid-green);background:var(--osid-green-soft);text-decoration:none;transform:translateX(3px)}.dropdown-panel a:hover:before,.dropdown-panel a:focus:before{background:var(--osid-green);transform:translateY(-50%) scale(1.25)}
@keyframes navSweep{0%,62%{transform:translateX(-120%)}78%,100%{transform:translateX(120%)}}
.ticker{display:flex;align-items:center;gap:12px;margin-bottom:18px;padding:10px 14px;border:1px solid #dfe8e1;border-radius:10px;background:#fff;color:var(--osid-green-dark);font-weight:700}.ticker-track{overflow:hidden;flex:1}.ticker-track span{display:inline-block;min-width:100%;white-space:nowrap;animation:tickerMove 28s linear infinite}@keyframes tickerMove{from{transform:translateX(100%)}to{transform:translateX(-100%)}}
.content-grid{display:grid;grid-template-columns:minmax(0,1fr) 445px;gap:28px;align-items:start}.side-column{display:grid;gap:12px}.info-card,.widget,.public-card{border:1px solid var(--osid-line);border-radius:14px;background:rgba(255,255,255,.94);box-shadow:0 12px 30px rgba(30,50,80,.06)}.date-card{min-height:106px;display:flex;align-items:center;gap:20px;padding:22px 26px;background:radial-gradient(circle at 90% 20%,rgba(245,180,95,.16),transparent 46px),linear-gradient(135deg,#fff,#f7faf8)}.date-icon,.section-icon{width:80px;height:50px;display:grid;place-items:center;border-radius:9px;color:var(--osid-green);background:var(--osid-green-soft);font-size:25px}.date-card strong{display:block;color:var(--osid-green);font-size:18px;font-weight:900}.date-card small{display:block;margin-top:8px;color:#6b7384;font-size:15px;font-weight:700}
.widget{padding:22px 26px}.widget h2{margin:0 0 22px;border-bottom:1px solid var(--osid-line);color:var(--osid-text);font-size:20px;font-weight:900;text-transform:uppercase}.widget h2:after,.section-head h2:after{content:"";display:block;width:54px;height:3px;margin-top:10px;border-radius:999px;background:var(--osid-green)}.widget h2 i{color:var(--osid-green);margin-right:10px}.login-actions{display:grid;gap:12px}.login-btn{height:53px;display:flex;align-items:center;justify-content:center;gap:16px;border-radius:7px;color:#fff;font-size:16px;font-weight:900;text-transform:uppercase;text-decoration:none}.login-btn:hover,.login-btn:focus{color:#fff;text-decoration:none;filter:brightness(1.04)}.login-btn.self{background:linear-gradient(135deg,#3daa46,#2b923e)}.login-btn.admin{background:linear-gradient(135deg,#006c50,#00513d)}
.category-list{list-style:none;padding:0;margin:0;display:grid;gap:13px}.category-list a{display:flex;align-items:center;gap:10px;color:#5f6978;font-size:15px;font-weight:700;text-decoration:none}.category-list a:hover{color:var(--osid-green)}.chart-title{display:flex;justify-content:center;gap:34px;margin-bottom:8px;color:var(--osid-text);font-weight:800}.bar-chart{height:180px;display:grid;grid-template-columns:repeat(3,1fr);align-items:end;gap:24px;padding:18px 28px 0;border-bottom:1px solid #cdd8e0;background:repeating-linear-gradient(to top,transparent 0,transparent 34px,rgba(110,120,135,.13) 35px)}.bar-item{height:100%;display:flex;align-items:center;justify-content:flex-end;flex-direction:column;gap:7px;text-align:center}.bar-value{color:#697386;font-size:12px;font-weight:800}.bar{width:48px;min-height:10px;display:block;border-radius:4px 4px 0 0}.bar.male{background:linear-gradient(180deg,#73b9f5,#4497dc)}.bar.female{background:linear-gradient(180deg,#4c4d55,#2d2e35)}.bar.total{background:linear-gradient(180deg,#94ea7c,#69d85f)}.bar-item small{min-height:35px;color:#5e6879;font-weight:700}.stat-total{display:flex;justify-content:space-between;align-items:center;margin-top:18px;font-weight:850}.stat-total strong{padding:8px 16px;border-radius:999px;color:var(--osid-green);background:var(--osid-green-soft)}
.people-list{display:grid;gap:14px}.person{display:flex;align-items:center;gap:13px}.person img{width:46px;height:46px;border-radius:999px;object-fit:cover;background:#e9f2ec}.person strong,.person small{display:block}.person strong{color:var(--osid-text);font-size:14px}.person small{color:#687386;font-size:12px}.home-footer{display:flex;justify-content:space-between;gap:24px;margin-top:28px;padding:26px 0 10px;color:#606a79}.home-footer strong{color:var(--osid-text)}.home-footer p{margin:8px 0 0}.socials{display:flex;gap:10px}.socials a{width:38px;height:38px;display:grid;place-items:center;border-radius:999px;color:#fff;background:var(--osid-green);text-decoration:none}
.section-head{display:flex;align-items:center;gap:20px;margin:32px 0 14px}.section-head h2{position:relative;margin:0;flex:1;color:var(--osid-text);font-size:26px;font-weight:900;text-transform:uppercase}.section-head a{display:inline-flex;align-items:center;gap:10px;height:45px;padding:0 17px;border:1px solid #91d3a8;border-radius:8px;color:var(--osid-green);background:#fff;font-weight:800;text-decoration:none}.hero-card{position:relative;min-height:520px;overflow:hidden;border-radius:16px;box-shadow:var(--osid-shadow);background:#0b3f2a}.hero-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,46,31,.78) 0%,rgba(0,76,43,.38) 48%,rgba(0,0,0,.10) 100%)}.hero-copy{position:absolute;left:140px;top:50%;width:min(520px,calc(100% - 260px));transform:translateY(-50%);color:#fff}.hero-copy h1{margin:0 0 8px;color:#fff;font-size:56px;line-height:1;font-weight:900;letter-spacing:0}.hero-copy h2{margin:0 0 22px;color:#fff;font-size:25px;font-weight:800}.hero-copy p{max-width:430px;margin:0 0 28px;color:rgba(255,255,255,.94);font-size:18px;line-height:1.55;font-weight:600}.hero-cta{display:inline-flex;align-items:center;gap:14px;height:52px;padding:0 26px;border-radius:8px;color:#fff;background:linear-gradient(135deg,#38a846,#1f8a42);font-size:16px;font-weight:850;text-decoration:none;box-shadow:0 12px 28px rgba(0,79,39,.24)}.hero-cta:hover,.hero-cta:focus{color:#fff;text-decoration:none;filter:brightness(1.05)}.hero-arrow{position:absolute;top:50%;width:58px;height:58px;border:0;border-radius:999px;color:var(--osid-green-dark);background:rgba(255,255,255,.86);font-size:24px;transform:translateY(-50%)}.hero-prev{left:22px}.hero-next{right:22px}.hero-dots{position:absolute;left:0;right:0;bottom:26px;display:flex;justify-content:center;gap:10px}.hero-dots span{width:14px;height:14px;border:2px solid rgba(255,255,255,.86);border-radius:999px}.hero-dots .on{background:#fff}
.featured{display:grid;grid-template-columns:445px minmax(0,1fr);gap:28px;padding:14px;border:1px solid var(--osid-line);border-radius:14px;background:#fff;box-shadow:var(--osid-shadow)}.featured-image{display:block;height:232px;overflow:hidden;border-radius:10px}.featured img,.compact-article img{width:100%;height:100%;object-fit:cover}.featured-body{padding:12px 8px 8px 0}.pill{display:inline-flex;align-items:center;min-height:28px;padding:4px 14px;border-radius:8px;color:var(--osid-green);background:var(--osid-green-soft);font-size:14px;font-weight:900;text-transform:uppercase}.featured h3,.compact-article h3{margin:12px 0;font-weight:900;line-height:1.25}.featured h3{font-size:22px}.featured h3 a,.compact-article h3 a{color:var(--osid-text);text-decoration:none}.featured p,.compact-article p{color:#4f5b6e;font-size:16px;line-height:1.72}.meta{display:flex;flex-wrap:wrap;gap:28px;margin-top:18px;color:#677386;font-size:14px}.meta i{margin-right:8px}.article-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.compact-article{display:grid;grid-template-columns:145px minmax(0,1fr);gap:16px;padding:12px;border:1px solid var(--osid-line);border-radius:14px;background:#fff}.compact-article img{height:118px;border-radius:9px}.compact-article span{color:var(--osid-green);font-size:12px;font-weight:900;text-transform:uppercase}.compact-article h3{margin:7px 0;font-size:17px}.compact-article p{margin:0;font-size:14px;line-height:1.5}
.public-card{padding:28px}.public-title{margin:0 0 12px;font-size:32px;font-weight:900;color:var(--osid-text)}.public-meta{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:22px;color:#677386;font-weight:700}.public-cover{width:100%;max-height:430px;object-fit:cover;border-radius:12px;margin-bottom:22px}.public-content{color:#334155;font-size:16px;line-height:1.8}.public-content img{max-width:100%;height:auto}.public-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}.public-gallery img{width:100%;height:160px;object-fit:cover;border-radius:10px}.public-back{display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:var(--osid-green);font-weight:800;text-decoration:none}.category-page-list{display:grid;gap:14px}.category-page-item{display:grid;grid-template-columns:130px minmax(0,1fr);gap:16px;padding:12px;border:1px solid var(--osid-line);border-radius:12px;background:#fff}.category-page-item img{width:130px;height:96px;object-fit:cover;border-radius:9px}.category-page-item h2{margin:0 0 8px;font-size:19px;font-weight:900}.category-page-item h2 a{color:var(--osid-text);text-decoration:none}.category-page-item p{margin:0;color:#677386}
@media(max-width:1180px){.osid-shell{width:min(100% - 32px,980px)}.site-header{align-items:flex-start;flex-direction:column}.search{width:100%}.main-nav .nav-list{overflow-x:auto}.content-grid{grid-template-columns:1fr}.side-column{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.osid-shell{width:min(100% - 20px,560px);padding-top:16px}.brand strong{font-size:18px}.brand small{font-size:12px}.brand-logo,.brand-logo img{width:46px;height:46px}.search{height:50px}.search button{width:64px;height:50px}.main-nav{position:relative;z-index:50;padding:8px}.hero-card{min-height:430px}.hero-copy{left:28px;width:calc(100% - 56px)}.hero-copy h1{font-size:38px}.hero-copy h2{font-size:20px}.hero-copy p{font-size:15px}.hero-arrow{display:none}.featured{grid-template-columns:1fr}.featured-image{height:220px}.article-list{grid-template-columns:1fr}.compact-article,.category-page-item{grid-template-columns:1fr}.compact-article img,.category-page-item img{width:100%;height:180px}.side-column{grid-template-columns:1fr}.home-footer{flex-direction:column}.public-title{font-size:25px}}
`
