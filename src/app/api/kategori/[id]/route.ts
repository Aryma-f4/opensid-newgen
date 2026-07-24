import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const kategori = await prisma.kategori.update({
    where: { id: parseInt(id) },
    data: {
      kategori: body.kategori,
      slug: body.slug || String(body.kategori || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      urut: body.urut ?? 0,
    },
  })
  return NextResponse.json(kategori)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.kategori.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}