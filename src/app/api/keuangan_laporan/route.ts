import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.keuangan, { search: ["tahun"], orderBy: { id: "desc" } })
