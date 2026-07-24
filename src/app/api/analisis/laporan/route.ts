import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id_master = url.searchParams.get("id_master")
  const id_periode = url.searchParams.get("id_periode")

  if (!id_master) {
    return NextResponse.json({ error: "id_master required" }, { status: 400 })
  }

  try {
    const masterId = parseInt(id_master)
    const whereIndikator = id_periode ? { id_periode: parseInt(id_periode) } : {}

    // Get all indikators for this master
    const indikators = await prisma.analisis_indikator.findMany({
      where: { id_master: masterId },
      include: {
        analisis_parameter: true,
        analisis_kategori_indikator: { select: { kategori: true } },
      },
      orderBy: { nomor: "asc" },
    })

    // Get all parameters for these indikators
    const indikatorIds = indikators.map((i) => i.id)

    // Count responses per indikator grouped by parameter
    const sql = `
      SELECT
        ar.id_indikator,
        ar.id_parameter,
        ap.jawaban as parameter_jawaban,
        ap.nilai as parameter_nilai,
        COUNT(*) as jumlah
      FROM analisis_respon ar
      LEFT JOIN analisis_parameter ap ON ar.id_parameter = ap.id
      WHERE ar.id_indikator IN (${indikatorIds.join(",")})
      ${id_periode ? "AND ar.id_periode = ?" : ""}
      GROUP BY ar.id_indikator, ar.id_parameter, ap.jawaban, ap.nilai
      ORDER BY ar.id_indikator, ap.nilai
    `
    const params: any[] = []
    if (id_periode) params.push(parseInt(id_periode))
    const responData: any[] = await prisma.$queryRawUnsafe(sql, ...params)

    // Build response structure
    const laporan = indikators.map((ind) => {
      const responForIndikator = responData.filter((r) => r.id_indikator === ind.id)
      const totalRespon = responForIndikator.reduce((sum, r) => sum + Number(r.jumlah), 0)
      return {
        id: ind.id,
        nomor: ind.nomor,
        pertanyaan: ind.pertanyaan,
        bobot: ind.bobot,
        kategori: ind.analisis_kategori_indikator?.kategori ?? "-",
        parameter: ind.analisis_parameter.map((p) => ({
          id: p.id,
          jawaban: p.jawaban,
          nilai: p.nilai,
          kode_jawaban: p.kode_jawaban,
        })),
        respon: responForIndikator.map((r) => ({
          id_parameter: r.id_parameter,
          jawaban: r.parameter_jawaban,
          nilai: Number(r.parameter_nilai),
          jumlah: Number(r.jumlah),
        })),
        total_respon: totalRespon,
      }
    })

    // Get master info
    const master = await prisma.analisis_master.findUnique({
      where: { id: masterId },
    })

    return NextResponse.json({
      master,
      indikators: laporan,
      total_indikator: indikators.length,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
