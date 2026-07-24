import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const perPage = parseInt(url.searchParams.get("perPage") ?? "20")
  const q = url.searchParams.get("q") ?? ""
  const dusun = url.searchParams.get("dusun")?.trim() || ""
  const kelasSosial = url.searchParams.get("kelas_sosial")?.trim() || ""

  const where: any = {}
  if (q) where.OR = [{ no_kk: { contains: q } }]
  if (kelasSosial) where.kelas_sosial = parseInt(kelasSosial)

  // Handle dusun filter by finding matching cluster ids
  if (dusun) {
    const clusterIds = await prisma.tweb_wil_clusterdesa.findMany({
      where: { dusun },
      select: { id: true },
    })
    if (clusterIds.length > 0) {
      where.id_cluster = { in: clusterIds.map((c) => c.id) }
    } else {
      // No matching dusun — return empty
      return NextResponse.json({ data: [], total: 0, page, perPage })
    }
  }

  const [data, total] = await Promise.all([
    prisma.tweb_keluarga.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        tweb_penduduk_tweb_keluarga_nik_kepalaTotweb_penduduk: { select: { nama: true, nik: true } },
      },
    }),
    prisma.tweb_keluarga.count({ where }),
  ])

  return NextResponse.json({ data, total, page, perPage })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const created = await prisma.tweb_keluarga.create({ data: body })
  return NextResponse.json(created)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body: any = {}
  try { body = await req.json() } catch {}
  if (body.ids?.length) {
    await prisma.tweb_keluarga.deleteMany({ where: { id: { in: body.ids } } })
  }
  return NextResponse.json({ ok: true })
}
