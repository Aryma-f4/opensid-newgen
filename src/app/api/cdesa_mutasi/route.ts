import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.mutasi_cdesa, { orderBy: { id: "desc" as any } })
