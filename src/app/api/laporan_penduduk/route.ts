import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.tweb_penduduk, { orderBy: { id: "desc" as any } })
