import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const perPage = parseInt(url.searchParams.get("perPage") ?? "20")
  const [data, total] = await Promise.all([
    prisma.sinergi_program.findMany({
      orderBy: [{ urut: "asc" }, { judul: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.sinergi_program.count(),
  ])
  return NextResponse.json({ data, total, page, perPage })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.sinergi_program.create({ data: body })
  return NextResponse.json(created)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body: any = {}
  try { body = await req.json() } catch {}
  if (body.ids?.length) {
    await prisma.sinergi_program.deleteMany({ where: { uuid: { in: body.ids } } })
  }
  return NextResponse.json({ ok: true })
}
