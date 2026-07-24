import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const menu = await prisma.menu.create({
    data: {
      nama: body.nama,
      link: body.link,
      parrent: body.parrent ?? 0,
      urut: body.urut ?? 0,
      enabled: body.enabled ?? true,
      config_id: body.config_id ?? 1,
    },
  })
  return NextResponse.json(menu)
}