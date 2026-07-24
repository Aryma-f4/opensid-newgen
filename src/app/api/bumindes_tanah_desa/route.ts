import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.tanah_desa, { search: ["nama"], orderBy: { id: "desc" } as any })
