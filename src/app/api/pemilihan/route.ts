import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const perPage = 20
  const [data, total] = await Promise.all([
    prisma.pemilihan.findMany({ orderBy: { uuid: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.pemilihan.count(),
  ])
  return NextResponse.json({ data, total, page, perPage })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.pemilihan.create({ data: body })
  return NextResponse.json(created)
}
