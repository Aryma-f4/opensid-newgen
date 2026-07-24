import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.pendapat, { search: ["pengguna"], orderBy: { id: "desc" } })
