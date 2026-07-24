import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.buku_tamu, { search: ["nama"], orderBy: { id: "desc" as any } })
