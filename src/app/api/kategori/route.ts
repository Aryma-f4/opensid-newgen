import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const kategori = await prisma.kategori.findMany({ orderBy: { urut: "asc" }, include: { _count: { select: { artikel: true } } } })
  return NextResponse.json(kategori)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const kategori = await prisma.kategori.create({
    data: {
      kategori: body.kategori,
      slug: body.slug || String(body.kategori || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      urut: body.urut ?? 0,
      enabled: 1,
      config_id: 1,
    },
  })
  return NextResponse.json(kategori)
}