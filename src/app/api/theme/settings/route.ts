import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.theme_settings, { orderBy: { id: "desc" as any } })
