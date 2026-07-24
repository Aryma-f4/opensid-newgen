import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.area, { search: ["nama"], orderBy: { id: "desc" as any } })
