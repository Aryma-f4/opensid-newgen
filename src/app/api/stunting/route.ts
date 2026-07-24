import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url); const page = parseInt(url.searchParams.get("page") ?? "1"); const perPage = 20
  const [data, total] = await Promise.all([
    prisma.sasaran_paud.findMany({ orderBy: { id_sasaran_paud: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.sasaran_paud.count(),
  ])
  return NextResponse.json({ data, total, page, perPage })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.sasaran_paud.create({ data: body })
  return NextResponse.json(created)
}
