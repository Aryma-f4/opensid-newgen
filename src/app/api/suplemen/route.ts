import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.suplemen, {
  search: ["nama"],
  orderBy: { id: "desc" },
  include: { suplemen_terdata: { select: { id: true } } },
})
