import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const menu = await prisma.menu.update({
    where: { id: parseInt(id) },
    data: {
      nama: body.nama,
      link: body.link,
      parrent: body.parrent ?? 0,
      urut: body.urut ?? 0,
      enabled: body.enabled ?? true,
    },
  })
  return NextResponse.json(menu)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.menu.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}