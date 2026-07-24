import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const articles = await prisma.artikel.findMany({
    where: { enabled: 1 },
    orderBy: { tgl_upload: "desc" },
    take: 20,
    select: { judul: true, slug: true, tgl_upload: true, isi: true },
  })

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>OpenSID - Feed</title>
    <link>${process.env.NEXTAUTH_URL || "http://localhost:3000"}</link>
    <description>Feed berita desa</description>
    ${articles.map((a: any) => `
    <item>
      <title>${a.judul ?? ""}</title>
      <link>${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artikel/${a.slug ?? ""}</link>
      <description>${(a.isi ?? "").substring(0, 200)}</description>
      <pubDate>${a.tgl_upload?.toUTCString() ?? ""}</pubDate>
    </item>`).join("")}
  </channel>
</rss>`

  return new NextResponse(feed, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
