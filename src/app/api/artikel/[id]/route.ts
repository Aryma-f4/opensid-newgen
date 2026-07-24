import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const slug = String(body.judul || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const artikel = await prisma.artikel.update({
    where: { id: parseInt(id) },
    data: {
      judul: body.judul,
      isi: body.isi,
      slug,
      id_kategori: body.id_kategori ? parseInt(body.id_kategori) : null,
      enabled: body.enabled ? 1 : 0,
      headline: body.headline ?? false,
      slider: body.slider ?? false,
      tipe: body.tipe ?? "dinamis",
    },
  })

  return NextResponse.json(artikel)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.artikel.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}