import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.mutasi_inventaris_gedung, { orderBy: { id: "desc" as any } })
