import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.kader_pemberdayaan_masyarakat, { search: ["nama"], orderBy: { id: "desc" } as any })
