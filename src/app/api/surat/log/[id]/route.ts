import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const item = await prisma.log_surat.findUnique({
    where: { id: parseInt(id) },
    include: {
      tweb_surat_format: true,
      tweb_penduduk: true,
      user: { select: { id: true, nama: true, username: true } },
    },
  })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const updateData: any = {}
  if (body.id_pend !== undefined) updateData.id_pend = parseInt(body.id_pend) || null
  if (body.id_pamong !== undefined) updateData.id_pamong = parseInt(body.id_pamong) || null
  if (body.nama_pamong !== undefined) updateData.nama_pamong = body.nama_pamong
  if (body.nama_jabatan !== undefined) updateData.nama_jabatan = body.nama_jabatan
  if (body.no_surat !== undefined) updateData.no_surat = body.no_surat
  if (body.nama_surat !== undefined) updateData.nama_surat = body.nama_surat
  if (body.pemohon !== undefined) updateData.pemohon = body.pemohon
  if (body.isi_surat !== undefined) updateData.isi_surat = body.isi_surat
  if (body.isi_surat_temp !== undefined) updateData.isi_surat_temp = body.isi_surat_temp
  if (body.keterangan !== undefined) updateData.keterangan = body.keterangan
  if (body.status !== undefined) updateData.status = parseInt(body.status)
  if (body.no_surat !== undefined) updateData.no_surat = body.no_surat

  const updated = await prisma.log_surat.update({
    where: { id: parseInt(id) },
    data: updateData,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.log_surat.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
