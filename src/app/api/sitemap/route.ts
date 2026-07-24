import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const articles = await prisma.artikel.findMany({
    where: { enabled: 1 },
    select: { slug: true, tgl_upload: true },
  })
  const categories = await prisma.kategori.findMany({
    where: { enabled: 1 },
    select: { id: true },
  })

  const urls = [
    { loc: `${baseUrl}/`, lastmod: new Date().toISOString() },
    ...articles.map((a) => ({ loc: `${baseUrl}/artikel/${a.slug ?? ""}`, lastmod: a.tgl_upload?.toISOString() ?? "" })),
    ...categories.map((c) => ({ loc: `${baseUrl}/kategori/${c.id}`, lastmod: new Date().toISOString() })),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((u) => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("")}
</urlset>`

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
