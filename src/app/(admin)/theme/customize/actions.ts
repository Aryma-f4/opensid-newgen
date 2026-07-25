"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { parsePuckLayout, isPublicRouteKey, starterPuckData, PUCK_ROUTE_KEYS } from "@/lib/themePuck"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Tidak memiliki akses.")
  return session
}

function getConfigId(user: any): number {
  return 1 // default config_id for now; extend from user session
}

export async function savePuckLayout(input: {
  themeId: string
  routeKey: string
  data: unknown
}) {
  await requireAdmin()

  if (!isPublicRouteKey(input.routeKey)) {
    throw new Error("Route key tidak valid")
  }

  const parsed = parsePuckLayout(input.data)
  const themeId = BigInt(input.themeId)

  // Verify theme ownership by config_id
  const theme = await prisma.theme.findFirst({
    where: { id: themeId, config_id: getConfigId(await requireAdmin()) },
  })
  if (!theme) throw new Error("Theme tidak ditemukan")

  // Upsert layout
  await prisma.theme_page_layouts.upsert({
    where: { theme_id_route_key: { theme_id: themeId, route_key: input.routeKey } },
    create: {
      config_id: getConfigId(await requireAdmin()),
      theme_id: themeId,
      route_key: input.routeKey,
      puck_data: parsed as any,
    },
    update: {
      puck_data: parsed as any,
    },
  })

  revalidatePath("/")
  revalidatePath("/theme/customize")
  return { success: true }
}

export async function createVisualTheme(name: string) {
  await requireAdmin()
  if (!name?.trim()) throw new Error("Nama tema wajib diisi")

  const theme = await prisma.theme.create({
    data: {
      config_id: getConfigId(await requireAdmin()),
      nama: name,
      renderer: "puck",
      status: 0,
    } as any,
  })

  // Create starter layouts for all 4 route keys
  for (const key of PUCK_ROUTE_KEYS) {
    const data = starterPuckData(key)
    await prisma.theme_page_layouts.create({
      data: {
        config_id: getConfigId(await requireAdmin()),
        theme_id: theme.id,
        route_key: key,
        puck_data: data as any,
      },
    })
  }

  revalidatePath("/theme/customize")
  revalidatePath("/theme/templates")
  return { success: true, themeId: theme.id.toString() }
}

export async function activateVisualTheme(themeId: string) {
  await requireAdmin()
  const id = BigInt(themeId)
  const configId = getConfigId(await requireAdmin())

  // Deactivate all themes for this config
  await prisma.theme.updateMany({
    where: { config_id: configId },
    data: { status: 0 },
  })

  // Activate the selected theme
  await prisma.theme.update({
    where: { id },
    data: { status: 1, renderer: "puck" },
  })

  revalidatePath("/theme/customize")
  revalidatePath("/theme/templates")
  return { success: true }
}

export async function restoreStarterLayout(themeId: string, routeKey: string) {
  await requireAdmin()
  if (!isPublicRouteKey(routeKey)) throw new Error("Route key tidak valid")

  const data = starterPuckData(routeKey)
  const id = BigInt(themeId)
  const configId = getConfigId(await requireAdmin())

  await prisma.theme_page_layouts.upsert({
    where: { theme_id_route_key: { theme_id: id, route_key: routeKey } },
    create: { config_id: configId, theme_id: id, route_key: routeKey, puck_data: data as any },
    update: { puck_data: data as any },
  })

  revalidatePath("/theme/customize")
  return { success: true }
}
