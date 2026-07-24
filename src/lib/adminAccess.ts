import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const requiredThreshold = { b: 1, u: 3, h: 7 } as const

type AccessLevel = keyof typeof requiredThreshold

export type AdminActor = {
  userId: number
  configId: number
  groupId: number | null
  pamongId: number | null
  isSuperAdmin: boolean
}

type AdminAccessDependencies = {
  auth: () => Promise<{ user?: { id?: string | null } } | null>
  prisma: Pick<typeof prisma, "user" | "setting_modul" | "grup_akses">
}

export function hasAccess(level: number | null | undefined, required: AccessLevel): boolean {
  return (level ?? 0) >= requiredThreshold[required]
}

function accessDenied(): never {
  throw new Error("Tidak memiliki akses.")
}

export function createRequireAdminAccess({ auth, prisma }: AdminAccessDependencies) {
  return async function requireAdminAccess(
    moduleUrl: string,
    required: AccessLevel,
  ): Promise<AdminActor> {
    const session = await auth()
    const userId = Number(session?.user?.id)

    if (!Number.isSafeInteger(userId) || userId <= 0) accessDenied()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, config_id: true, id_grup: true, pamong_id: true },
    })

    if (!user) accessDenied()

    const accessModule = await prisma.setting_modul.findFirst({
      where: { config_id: user.config_id, url: moduleUrl },
      select: { id: true },
    })

    if (!accessModule) accessDenied()

    const superAdmin = await prisma.user.findFirst({
      where: {
        config_id: user.config_id,
        user_grup: { slug: "administrator" },
      },
      orderBy: { id: "asc" },
      select: { id: true },
    })

    const isSuperAdmin = superAdmin?.id === user.id
    if (!isSuperAdmin) {
      if (!user.id_grup) accessDenied()

      const access = await prisma.grup_akses.findFirst({
        where: {
          config_id: user.config_id,
          id_grup: user.id_grup,
          id_modul: accessModule.id,
        },
        select: { akses: true },
      })

      if (!access || !hasAccess(access.akses, required)) accessDenied()
    }

    return {
      userId: user.id,
      configId: user.config_id,
      groupId: user.id_grup,
      pamongId: user.pamong_id,
      isSuperAdmin,
    }
  }
}

export function requireAdminAccess(moduleUrl: string, required: AccessLevel): Promise<AdminActor> {
  return createRequireAdminAccess({ auth, prisma })(moduleUrl, required)
}
