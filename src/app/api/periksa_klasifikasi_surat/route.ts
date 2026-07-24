import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.klasifikasi_surat, { search: ["kode", "nama"], orderBy: { kode: "asc" as any } })
