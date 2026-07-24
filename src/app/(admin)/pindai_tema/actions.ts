"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import fs from "node:fs"
import path from "node:path"

async function ck() {
  if (!(await auth())?.user?.id) throw new Error("Unauthorized")
}

export type ThemeItem = {
  id: number | null
  nama: string
  slug: string | null
  versi: string | null
  path: string
  status: number
  keterangan: string | null
  diDb: boolean
  diDisk: boolean
}

export async function scanThemes(): Promise<ThemeItem[]> {
  await ck()

  const themesDir = path.join(process.cwd(), "public", "themes")

  // Get folders from disk
  let diskFolders: string[] = []
  try {
    diskFolders = fs.readdirSync(themesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  } catch {
    // themes directory might not exist
  }

  // Get themes from DB
  const dbThemes = await prisma.theme.findMany({ orderBy: { id: "desc" as any } })

  // Build merged list
  const seen = new Set<string>()
  const result: ThemeItem[] = []

  // First add DB themes
  for (const t of dbThemes) {
    const folderName = t.path || t.nama
    seen.add(folderName)
    result.push({
      id: Number(t.id),
      nama: t.nama,
      slug: t.slug,
      versi: t.versi,
      path: folderName,
      status: t.status,
      keterangan: t.keterangan,
      diDb: true,
      diDisk: diskFolders.includes(folderName),
    })
  }

  // Then add disk-only themes (found on filesystem but not in DB)
  for (const folder of diskFolders) {
    if (!seen.has(folder)) {
      result.push({
        id: null,
        nama: folder,
        slug: null,
        versi: null,
        path: folder,
        status: 0,
        keterangan: null,
        diDb: false,
        diDisk: true,
      })
    }
  }

  return result
}

export async function activateTheme(id: number) {
  await ck()
  // Deactivate all themes first
  await prisma.theme.updateMany({ where: { status: 1 }, data: { status: 0 } })
  // Activate the selected theme
  await prisma.theme.update({ where: { id }, data: { status: 1 } })
  revalidatePath("/pindai_tema")
  return { success: true }
}

export async function deleteTheme(id: number) {
  await ck()
  await prisma.theme.delete({ where: { id } })
  revalidatePath("/pindai_tema")
  return { success: true }
}
