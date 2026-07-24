import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.artikel, {
  search: ["judul"],
  where: () => ({ slider: true }),
  orderBy: { id: "desc" },
})
