import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.theme_widgets, { orderBy: { sort_order: "asc" as any } })
