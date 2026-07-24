import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"

export const { GET, POST, DELETE } = makeCollection(prisma.analisis_parameter, { orderBy: { id: "desc" as any } })
