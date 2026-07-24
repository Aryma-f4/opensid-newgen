import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.pembangunan, { search: ["nama_kegiatan"], orderBy: { id: "desc" } as any })
