import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.pembangunan_ref_dokumentasi, { orderBy: { id: "desc" as any } })
