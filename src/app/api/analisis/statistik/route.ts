import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id_master = url.searchParams.get("id_master")
  const id_periode = url.searchParams.get("id_periode")
  const id_indikator = url.searchParams.get("id_indikator")

  if (!id_master) {
    return NextResponse.json({ error: "id_master required" }, { status: 400 })
  }

  try {
    const masterId = parseInt(id_master)
    const indikatorWhere: any = { id_master: masterId }
    if (id_indikator) indikatorWhere.id = parseInt(id_indikator)

    const indikators = await prisma.analisis_indikator.findMany({
      where: indikatorWhere,
      include: {
        analisis_parameter: { orderBy: { nilai: "asc" } },
        analisis_kategori_indikator: { select: { kategori: true } },
      },
      orderBy: { nomor: "asc" },
    })

    const indikatorIds = indikators.map((i) => i.id)

    if (indikatorIds.length === 0) {
      return NextResponse.json({ indikators: [], total_responden: 0 })
    }

    // Get total distinct respondents
    const totalSql = `
      SELECT COUNT(DISTINCT CONCAT(ar.id_subjek, '-', ar.id_periode)) as total
      FROM analisis_respon ar
      WHERE ar.id_indikator IN (${indikatorIds.join(",")})
      ${id_periode ? "AND ar.id_periode = ?" : ""}
    `
    const params: any[] = []
    if (id_periode) params.push(parseInt(id_periode))
    const totalResult: any[] = await prisma.$queryRawUnsafe(totalSql, ...params)
    const total_responden = Number(totalResult[0]?.total ?? 0)

    // Get response distribution per parameter per indikator
    const respSql = `
      SELECT
        ar.id_indikator,
        ar.id_parameter,
        ap.jawaban as parameter_jawaban,
        ap.nilai as parameter_nilai,
        COUNT(*) as jumlah,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY ar.id_indikator), 0), 1) as persen
      FROM analisis_respon ar
      LEFT JOIN analisis_parameter ap ON ar.id_parameter = ap.id
      WHERE ar.id_indikator IN (${indikatorIds.join(",")})
      ${id_periode ? "AND ar.id_periode = ?" : ""}
      GROUP BY ar.id_indikator, ar.id_parameter, ap.jawaban, ap.nilai
      ORDER BY ar.id_indikator, ap.nilai
    `
    const respData: any[] = await prisma.$queryRawUnsafe(respSql, ...params)

    // Build response structure
    const statistik = indikators.map((ind) => {
      const responForIndikator = respData.filter((r) => r.id_indikator === ind.id)
      const totalJawaban = responForIndikator.reduce((sum, r) => sum + Number(r.jumlah), 0)

      return {
        id: ind.id,
        nomor: ind.nomor,
        pertanyaan: ind.pertanyaan,
        bobot: ind.bobot,
        id_tipe: ind.id_tipe,
        is_teks: ind.is_teks,
        is_publik: ind.is_publik,
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
          persen: Number(r.persen),
        })),
        total_jawaban: totalJawaban,
      }
    })

    // Get available periods for this master
    const periodeSql = `
      SELECT DISTINCT ap.id, ap.nama
      FROM analisis_respon ar
      LEFT JOIN analisis_periode ap ON ar.id_periode = ap.id
      WHERE ar.id_indikator IN (${indikatorIds.join(",")})
      ORDER BY ap.nama
    `
    const periodeList: any[] = await prisma.$queryRawUnsafe(periodeSql)

    return NextResponse.json({
      indikators: statistik,
      periode: periodeList,
      total_responden,
      total_indikator: indikators.length,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
