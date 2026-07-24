import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.gambar_gallery, {
  search: ["nama"],
  orderBy: [{ urut: "asc" }, { id: "asc" }],
})
