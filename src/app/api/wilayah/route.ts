import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"

export const { GET, POST, DELETE } = makeCollection(prisma.tweb_wil_clusterdesa, {
  orderBy: [{ dusun: "asc" }, { rw: "asc" }, { rt: "asc" }],
})
