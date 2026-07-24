import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.cdesa, { search: ["nomor", "nama_kepemilikan"], orderBy: { id: "desc" } })
