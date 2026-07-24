import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.inventaris_kontruksi, { orderBy: { id: "desc" as any } })
