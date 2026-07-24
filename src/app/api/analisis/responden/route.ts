import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const perPage = parseInt(url.searchParams.get("perPage") ?? "20")
  const id_master = url.searchParams.get("id_master")
  const id_periode = url.searchParams.get("id_periode")
  const q = url.searchParams.get("q") ?? ""
  const skip = (page - 1) * perPage

  try {
    // Get distinct respondent-subjek-periode combinations from analisis_respon
    const where: string[] = []
    const params: any[] = []

    if (id_master) {
      // id_master is not directly in analisis_respon, need to go through indikator
      where.push("ai.id_master = ?")
      params.push(parseInt(id_master))
    }
    if (id_periode) {
      where.push("ar.id_periode = ?")
      params.push(parseInt(id_periode))
    }
    if (q) {
      where.push("(tp.nama LIKE ? OR tp.nik LIKE ? OR tk.no_kk LIKE ?)")
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""

    // Count distinct respondents
    const countSql = `
      SELECT COUNT(*) as total FROM (
        SELECT DISTINCT ar.id_subjek, ar.id_periode, ar.penduduk_id, ar.keluarga_id
        FROM analisis_respon ar
        LEFT JOIN analisis_indikator ai ON ar.id_indikator = ai.id
        LEFT JOIN tweb_penduduk tp ON ar.penduduk_id = tp.id
        LEFT JOIN tweb_keluarga tk ON ar.keluarga_id = tk.id
        ${whereClause}
      ) tmp
    `
    const countResult: any = await prisma.$queryRawUnsafe(countSql, ...params)
    const total = Number(countResult[0]?.total ?? 0)

    // Get distinct respondents with summary
    const dataSql = `
      SELECT
        ar.id_subjek,
        ar.id_periode,
        ar.penduduk_id,
        ar.keluarga_id,
        tp.nama as penduduk_nama,
        tp.nik as penduduk_nik,
        tk.no_kk as keluarga_no_kk,
        ap.nama as periode_nama,
        am.nama as master_nama,
        am.id as master_id,
        COUNT(DISTINCT ar.id_indikator) as total_indikator,
        COUNT(DISTINCT ar.id_parameter) as total_terjawab,
        MIN(ar.id) as id
      FROM analisis_respon ar
      LEFT JOIN analisis_indikator ai ON ar.id_indikator = ai.id
      LEFT JOIN analisis_master am ON ai.id_master = am.id
      LEFT JOIN analisis_periode ap ON ar.id_periode = ap.id
      LEFT JOIN tweb_penduduk tp ON ar.penduduk_id = tp.id
      LEFT JOIN tweb_keluarga tk ON ar.keluarga_id = tk.id
      ${whereClause}
      GROUP BY ar.id_subjek, ar.id_periode, ar.penduduk_id, ar.keluarga_id, tp.nama, tp.nik, tk.no_kk, ap.nama, am.nama, am.id
      ORDER BY ar.id_subjek DESC
      LIMIT ? OFFSET ?
    `
    params.push(perPage, skip)
    const data: any = await prisma.$queryRawUnsafe(dataSql, ...params)

    return NextResponse.json({ data, total, page, perPage })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
