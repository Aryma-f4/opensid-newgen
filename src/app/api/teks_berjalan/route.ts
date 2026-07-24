import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.teks_berjalan, {
  orderBy: [{ urut: "asc" }, { id: "asc" }],
})
