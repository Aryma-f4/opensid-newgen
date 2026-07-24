import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File
  const model = formData.get("model") as string
  const columns = JSON.parse(formData.get("columns") as string) as { key: string; label: string }[]

  if (!file || !model || !columns) {
    return NextResponse.json({ error: "Missing file, model, or columns" }, { status: 400 })
  }

  const results = { imported: 0, errors: 0, messages: [] as string[] }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: "No sheets found in file" }, { status: 400 })
    }

    const sheet = workbook.Sheets[sheetName]
    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })

    if (jsonData.length === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    const header = Object.keys(jsonData[0])

    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i]
        const record: Record<string, any> = { config_id: 1 }

        columns.forEach((col) => {
          const val = row[col.label]
          if (val !== undefined && val !== "") {
            record[col.key] = val
          }
        })

        const delegate = (prisma as any)[model]
        if (!delegate?.create) {
          results.errors++
          results.messages.push(`Row ${i + 1}: Unknown model '${model}'`)
          continue
        }

        await delegate.create({ data: record })
        results.imported++
      } catch (e: any) {
        results.errors++
        results.messages.push(`Row ${i + 1}: ${e.message}`)
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to parse file: ${e.message}` }, { status: 400 })
  }

  return NextResponse.json(results)
}
