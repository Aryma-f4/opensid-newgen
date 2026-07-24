import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q") ?? ""
  if (q.length < 2) return NextResponse.json([])
  const results = await prisma.tweb_penduduk.findMany({
    where: { OR: [{ nik: { contains: q } }, { nama: { contains: q } }], status_dasar: 1 },
    take: 50, orderBy: { nama: "asc" },
  })
  return NextResponse.json(results)
}
