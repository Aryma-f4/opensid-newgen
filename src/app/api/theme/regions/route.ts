import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.theme_regions, { orderBy: { id: "asc" as any } })
