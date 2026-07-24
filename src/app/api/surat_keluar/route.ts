import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const perPage = parseInt(url.searchParams.get("perPage") ?? "20")
  const q = url.searchParams.get("q") ?? ""
  const tglFrom = url.searchParams.get("tgl_from")?.trim() || ""
  const tglTo = url.searchParams.get("tgl_to")?.trim() || ""

  const where: any = {}
  if (q) {
    where.OR = [
      { nomor_surat: { contains: q } },
      { tujuan: { contains: q } },
    ]
  }
  if (tglFrom) {
    where.tanggal_surat = { ...(where.tanggal_surat || {}), gte: new Date(tglFrom) }
  }
  if (tglTo) {
    where.tanggal_surat = { ...(where.tanggal_surat || {}), lte: new Date(tglTo + "T23:59:59") }
  }

  const [data, total] = await Promise.all([
    prisma.surat_keluar.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.surat_keluar.count({ where }),
  ])

  return NextResponse.json({ data, total, page, perPage })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.surat_keluar.create({ data: body })
  return NextResponse.json(created)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body: any = {}
  try { body = await req.json() } catch {}
  if (body.ids?.length) {
    await prisma.surat_keluar.deleteMany({ where: { id: { in: body.ids } } })
  }
  return NextResponse.json({ ok: true })
}
