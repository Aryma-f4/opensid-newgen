import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.tweb_penduduk_mandiri.findUnique({ where: { id_pend: parseInt(id) } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.tweb_penduduk_mandiri.update({ where: { id_pend: parseInt(id) }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.tweb_penduduk_mandiri.delete({ where: { id_pend: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
