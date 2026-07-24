import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const slug = String(body.judul || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const artikel = await prisma.artikel.create({
    data: {
      judul: body.judul,
      isi: body.isi,
      slug,
      id_kategori: body.id_kategori ? parseInt(body.id_kategori) : null,
      enabled: body.enabled ? 1 : 0,
      headline: body.headline ?? false,
      slider: body.slider ?? false,
      tipe: body.tipe ?? "dinamis",
      config_id: 1,
      id_user: parseInt(session.user.id),
    },
  })

  return NextResponse.json(artikel)
}

export async function GET() {
  const artikel = await prisma.artikel.findMany({
    orderBy: { tgl_upload: "desc" },
    include: { kategori: true },
    take: 20,
  })
  return NextResponse.json(artikel)
}
