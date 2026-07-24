import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.keuangan_template, { search: ["uraian"], orderBy: { uraian: "asc" } })
