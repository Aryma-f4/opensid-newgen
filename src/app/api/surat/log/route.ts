import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const perPage = parseInt(url.searchParams.get("perPage") ?? "20")
  const status = url.searchParams.get("status") // "0"=konsep, "1"=cetak, "2"=approve, or all
  const q = url.searchParams.get("q") ?? ""
  const tglFrom = url.searchParams.get("tgl_from") ?? ""
  const tglTo = url.searchParams.get("tgl_to") ?? ""

  const where: any = { config_id: 1 }
  if (status !== null && status !== "") where.status = parseInt(status)
  if (q) {
    where.OR = [
      { no_surat: { contains: q } },
      { nama_surat: { contains: q } },
      { pemohon: { contains: q } },
    ]
  }
  if (tglFrom) where.tanggal = { ...(where.tanggal || {}), gte: new Date(tglFrom) }
  if (tglTo) where.tanggal = { ...(where.tanggal || {}), lte: new Date(tglTo + "T23:59:59") }

  const [data, total] = await Promise.all([
    prisma.log_surat.findMany({
      where,
      orderBy: { tanggal: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        tweb_surat_format: { select: { nama: true, url_surat: true, kode_surat: true } },
        tweb_penduduk: { select: { id: true, nik: true, nama: true } },
      },
    }),
    prisma.log_surat.count({ where }),
  ])

  return NextResponse.json({ data, total, page, perPage })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  // Validate required fields
  if (!body.id_format_surat) {
    return NextResponse.json({ error: "Format surat diperlukan" }, { status: 400 })
  }

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = String(now.getFullYear())

  const log = await prisma.log_surat.create({
    data: {
      config_id: 1,
      id_format_surat: parseInt(body.id_format_surat),
      id_pend: body.id_pend ? parseInt(body.id_pend) : null,
      id_user: parseInt(session.user.id),
      id_pamong: body.id_pamong ? parseInt(body.id_pamong) : null,
      nama_pamong: body.nama_pamong || null,
      nama_jabatan: body.nama_jabatan || null,
      tanggal: now,
      bulan: month,
      tahun: year,
      no_surat: body.no_surat || null,
      nama_surat: body.nama_surat || null,
      pemohon: body.pemohon || null,
      isi_surat: body.isi_surat || null,
      isi_surat_temp: body.isi_surat_temp || null,
      keterangan: body.keterangan || null,
      lampiran: body.lampiran || null,
      status: body.status !== undefined ? parseInt(body.status) : 0, // 0 = draft/konsep
      input: body.input || null,
    },
  })

  return NextResponse.json(log, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: any = {}
  try { body = await req.json() } catch {}

  if (body.ids?.length) {
    await prisma.log_surat.deleteMany({ where: { id: { in: body.ids.map(Number) }, config_id: 1 } })
  }
  return NextResponse.json({ ok: true })
}
