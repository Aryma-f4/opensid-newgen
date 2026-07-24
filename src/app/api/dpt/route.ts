import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.dtks, { search: ["nama"], orderBy: { id: "desc" } })
