import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.tweb_penduduk, { search: ["dusun"], orderBy: { id: "desc" } as any })
