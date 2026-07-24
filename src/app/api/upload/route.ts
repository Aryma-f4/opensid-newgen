import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const subdir = (formData.get("subdir") as string) || "dokumen"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ""
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const relativePath = path.join(subdir, safeName)

    // Storage path: public/storage/<subdir>/<file>
    const storagePath = path.join(process.cwd(), "public", "storage", relativePath)
    await mkdir(path.dirname(storagePath), { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(storagePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/storage/${relativePath}`,
      filename: safeName,
      path: relativePath,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
