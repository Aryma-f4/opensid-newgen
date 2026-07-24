import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
// custom for kontak_grup (id_grup PK)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const item = await prisma.kontak_grup.findUnique({ where: { id_grup: parseInt(id) } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 }); return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params; const body = await req.json()
  const updated = await prisma.kontak_grup.update({ where: { id_grup: parseInt(id) }, data: body }); return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params; await prisma.kontak_grup.delete({ where: { id_grup: parseInt(id) } }); return NextResponse.json({ ok: true })
}
