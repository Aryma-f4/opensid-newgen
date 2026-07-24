import Link from "next/link"

export const dynamic = "force-dynamic"

export default function LayananMandiriPage() {
  return (
    <section className="public-card">
      <h1 className="public-title">Layanan Mandiri</h1>
      <div className="public-content">
        <p>
          Halaman layanan mandiri sedang disiapkan di versi Next.js. Gunakan menu admin jika perlu mengelola layanan surat atau data warga.
        </p>
      </div>
      <Link href="/" className="public-back">
        <i className="fa fa-arrow-left" /> Kembali ke Beranda
      </Link>
    </section>
  )
}
