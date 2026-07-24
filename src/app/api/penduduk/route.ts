import { prisma } from "@/lib/prisma"
import { makeCollection, makeItem } from "@/lib/crud"

export const { GET, POST, DELETE } = makeCollection(prisma.tweb_penduduk, {
  search: ["nik", "nama"],
  orderBy: { id: "desc" },
})
