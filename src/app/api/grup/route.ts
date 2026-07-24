import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.user_grup, { search: ["nama"], orderBy: { id: "asc" }, include: { user: { select: { id: true } } } })
